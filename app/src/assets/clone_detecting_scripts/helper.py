import xmltodict
import json

class CloneInfo(dict):
    def __init__(self, class_id: int, pcid: int, file: str, start_line: int, end_line: int, global_id: int = -1, change_count: int = 0):
        dict.__init__(self, class_id = class_id, pcid = pcid, file = file, start_line = start_line, end_line = end_line, global_id = global_id, change_count = change_count)
    
    @property
    def class_id(self):
        return self["class_id"]
    @class_id.setter
    def class_id(self, value):
        self["class_id"] = value

    @property
    def pcid(self):
        return self["pcid"]
    @pcid.setter
    def pcid(self, value):
        self["pcid"] = value

    @property
    def file(self):
        return self["file"]
    @file.setter
    def file(self, value):
        self["file"] = value

    @property
    def start_line(self):
        return self["start_line"]
    @start_line.setter
    def start_line(self, value):
        self["start_line"] = value
    
    @property
    def end_line(self):
        return self["end_line"]
    @end_line.setter
    def end_line(self, value):
        self["end_line"] = value

    @property
    def global_id(self):
        return self["global_id"]
    @global_id.setter
    def global_id(self, value):
        self["global_id"] = value
    
    @property
    def change_count(self):
        return self["change_count"]
    @change_count.setter
    def change_count(self, value):
        self["change_count"] = value


class ChangeInfo:
    def __init__(self, file_path: str, line: int, operation: str):
        self.file_path = file_path
        self.line = line
        self.operation = operation
    
    def __str__(self):
        return self.file_path + ":" + str(self.line) + ":" + self.operation


def file_to_string(file_path: str):
    with open(file_path, 'r') as file:
        return file.read()


def parse_xml_file_to_dict(file_path: str):
    content = file_to_string(file_path)
    if len(content) > 0:
        return xmltodict.parse(content)
    else:
        return None