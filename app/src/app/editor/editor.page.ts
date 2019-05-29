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

  constructor(private electronService: ElectronService, private fsService: FsService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.updateIsWindowMaximized();
    this.electronService.remote.getCurrentWindow().on('resize', () => this.updateIsWindowMaximized());
  }
  
  async editorFrameLoadedHandler() {
    // the fs service does not implement types
    var fs = this.fsService.fs as any;
    var filePath = this.route.snapshot.queryParamMap.get('filePath');
    var language = this.route.snapshot.queryParamMap.get('language');
    var startLine = parseInt(this.route.snapshot.queryParamMap.get('startLine'));
    var endLine = parseInt(this.route.snapshot.queryParamMap.get('endLine'));

    var value = fs.readFileSync(filePath, 'utf8');
    var highlightlines = [];
    for (var i = startLine; i <= endLine; i++) {
      highlightlines.push(i);
    }

    const editorFrame: {
      initializeEditor(value: string, language: string, highlightLines: number[]): monaco.editor.IStandaloneCodeEditor
    } = window.frames['editor-frame'];

    var editor = await editorFrame.initializeEditor(value, language, highlightlines);
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
    }
    else {
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
