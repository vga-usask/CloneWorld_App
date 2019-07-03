/// <reference path="../../../node_modules/monaco-editor/monaco.d.ts" />

import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ActivatedRoute } from '@angular/router';
import { FsService } from 'ngx-fs';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss'],
})
export class EditorPage implements OnInit {

  isWindowMaximized: boolean;
  currentEditor: monaco.editor.IStandaloneCodeEditor;
  currentFilePath: string;

  constructor(private electronService: ElectronService, private fsService: FsService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.updateIsWindowMaximized();
    this.electronService.remote.getCurrentWindow().on('resize', () => this.updateIsWindowMaximized());
  }

  async editorFrameLoadedHandler() {
    // the fs service does not implement types
    let fs = this.fsService.fs as any;
    this.currentFilePath = this.route.snapshot.queryParamMap.get('filePath');
    let language = this.route.snapshot.queryParamMap.get('language');
    let startLine = parseInt(this.route.snapshot.queryParamMap.get('startLine'));
    let endLine = parseInt(this.route.snapshot.queryParamMap.get('endLine'));

    let value = fs.readFileSync(this.currentFilePath, 'utf8');
    let highlightlines = [];
    for (let i = startLine; i <= endLine; i++) {
      highlightlines.push(i);
    }

    const editorFrame: {
      initializeEditor(value: string, language: string, highlightLines: number[]): monaco.editor.IStandaloneCodeEditor
    } = window.frames['editor-frame'];

    this.currentEditor = await editorFrame.initializeEditor(value, language, highlightlines);
  }

  saveFile() {
    if (this.currentEditor) {
      let content = this.currentEditor.getValue();
      // the fs service does not implement types
      let fs = this.fsService.fs as any;
      fs.writeFileSync(this.currentFilePath, content);
    }
  }

  openDebugger() {
    this.electronService.remote.getCurrentWebContents().openDevTools();
  }

  minimizeWindow() {
    this.electronService.remote.getCurrentWindow().minimize();
  }

  maximizeOrUnmaximizeWindow() {
    if (this.isWindowMaximized) {
      this.electronService.remote.getCurrentWindow().unmaximize();
    } else {
      this.electronService.remote.getCurrentWindow().maximize();
    }
  }

  close() {
    this.electronService.remote.getCurrentWindow().close();
  }

  updateIsWindowMaximized() {
    this.isWindowMaximized = this.electronService.remote.getCurrentWindow().isMaximized();
  }

}
