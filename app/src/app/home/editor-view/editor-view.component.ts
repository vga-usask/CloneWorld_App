import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FsService } from 'ngx-fs';

@Component({
  selector: 'app-editor-view',
  templateUrl: './editor-view.component.html',
  styleUrls: ['./editor-view.component.scss'],
})
export class EditorViewComponent implements OnInit {
  monacoModule: typeof monaco;
  container: HTMLElement;
  editorInstance: monaco.editor.IStandaloneCodeEditor;

  editorModels: monaco.editor.ITextModel[] = [];
  editorModelViewStates: Map<monaco.editor.ITextModel, monaco.editor.ICodeEditorViewState> = new Map();

  _currentEditorModel: monaco.editor.ITextModel;
  get currentEditorModel() {
    return this._currentEditorModel;
  }
  set currentEditorModel(value: monaco.editor.ITextModel) {
    if (this.currentEditorModel) {
      this.editorModelViewStates.set(this.currentEditorModel, this.editorInstance.saveViewState());
    }
    this._currentEditorModel = value;
    this.editorInstance.setModel(value);
    this.editorInstance.restoreViewState(this.editorModelViewStates.get(value));
  }

  @Input() updateChartByFindingRelatedClones: (filePath: string, lineNumber: number) => void;

  constructor(private fsService: FsService) { }

  ngOnInit() { }

  async initializeMonaco() {
    const editorFrame: {
      initializeEditor(value: string, language: string, highlightLines: number[]): monaco.editor.IStandaloneCodeEditor;
      getMonacoAndContainer(): {
        monacoModule: typeof monaco;
        container: HTMLElement;
      };
    } = window.frames['editor-frame'];
    const { monacoModule, container } = await editorFrame.getMonacoAndContainer();
    this.monacoModule = monacoModule;
    this.container = container;

    this.editorInstance = this.monacoModule.editor.create(this.container);
    this.editorInstance.addAction({
      id: 'find-related-clones',
      label: 'Find Related Clones',
      keybindings: [
        monacoModule.KeyMod.Alt | monacoModule.KeyMod.Shift | monacoModule.KeyCode.KEY_C
      ],
      contextMenuGroupId: 'navigation',
      run: editor => {
        this.updateChartByFindingRelatedClones(editor.getModel().uri.fsPath, editor.getPosition().lineNumber);
        // alert('Not Implemented yet.\nfile path: ' + editor.getModel().uri.fsPath + '\nposition: ' + editor.getPosition())
      }
    });
    this.editorInstance.setModel(null);

    (editorFrame as any).window.onresize = () => this.editorInstance.layout();
  }

  createNewEditorTab = (filePath: string, language: string, startLine?: number, endLine?: number) => {
    if (this.monacoModule && this.container) {
      // the fs service does not implement types
      const fs = this.fsService.fs as any;

      const value = fs.readFileSync(filePath, 'utf8');

      let model = this.monacoModule.editor.getModels().find(m => m.uri.toString() === this.monacoModule.Uri.file(filePath).toString());
      if (model) {
        model.setValue(value);
      } else {
        model = this.monacoModule.editor.createModel(value, language, this.monacoModule.Uri.file(filePath));
      }

      const highlights = [];
      if (startLine && endLine) {
        highlights.push({ range: new this.monacoModule.Range(startLine, 1, endLine, 1), options: { isWholeLine: true, linesDecorationsClassName: 'myLineDecoration' } })
        model.deltaDecorations([], highlights);
      }

      this.editorInstance.setModel(model);
      if (highlights.length > 0) {
        this.editorInstance.revealLineInCenter(startLine);
      }
      if (!this.editorModels.find(m => m === model)) {
        this.editorModels.push(model);
      }
      this.currentEditorModel = model;
    }
  }

  obatinFileName(path: string) {
    return path.replace(/^.*[\\\/]/, '');
  }

  saveFile() {
    if (this.currentEditorModel) {
      let content = this.currentEditorModel.getValue();
      // the fs service does not implement types
      let fs = this.fsService.fs as any;
      fs.writeFileSync(this.currentEditorModel.uri.fsPath, content);
    }
  }

  closeModel(model: monaco.editor.ITextModel) {
    this.editorModels.splice(this.editorModels.findIndex(m => m === model), 1);
    if (this.currentEditorModel === model) {
      this.currentEditorModel = this.editorModels[0];
    }
  }

}
