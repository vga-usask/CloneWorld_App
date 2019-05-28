/// <reference path="../../../node_modules/monaco-editor/monaco.d.ts" />

import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss'],
})
export class EditorPage implements OnInit {

  isWindowMaximized: boolean;

  constructor(private electronService: ElectronService) { }

  ngOnInit() {
    this.updateIsWindowMaximized();
  }

  async editorFrameLoadedHandler() {
    var value = [
      '"use strict";',
      'function Person(age) {',
      '	if (age) {',
      '		this.age = age;',
      '	}',
      '}',
      'Person.prototype.getAge = function () {',
      '	return this.age;',
      '};'
    ].join('\n');
    var highlightlines = [3, 4, 5];

    const editorFrame: {
      initializeEditor(value: string, language: string, highlightLines: number[]): monaco.editor.IStandaloneCodeEditor
    } = window.frames['editor-frame'];

    var editor = await editorFrame.initializeEditor(value, 'typescript', highlightlines);
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
    this.updateIsWindowMaximized();
  }

  close() {
    this.electronService.remote.getCurrentWindow().close();
  }

  updateIsWindowMaximized() {
    this.isWindowMaximized = this.electronService.remote.getCurrentWindow().isMaximized();
  }

}
