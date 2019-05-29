from helper import *
from typing import Callable, Sequence
import collections
import json
import os
import shutil
import sys


def read_clone_class_node_from_root_node(xml_node: dict) -> dict:
    try:
        clones = xml_node["clones"]
        return clones["class"]
    except:
        return None

def obtain_clone_class_node(report_path: str, revision_id: int) -> dict:
    parsed_xml = parse_xml_file_to_dict(report_path + "/" + str(revision_id))
    map_clone[revision_id] = dict()
    return read_clone_class_node_from_root_node(parsed_xml)

def assign_global_id(revision_id: int, clone_to_be_assigned: CloneInfo, clone_from_previous_revision: CloneInfo = None):
    if clone_from_previous_revision is None:
        global_id = len(map_global_id)
        map_global_id[global_id] = dict()
    else:
        global_id = clone_from_previous_revision.global_id
    clone_to_be_assigned.global_id = global_id
    map_global_id[global_id][revision_id] = clone_to_be_assigned

def put_single_clone_into_map(clone_class: dict, clone: CloneInfo, new_global_id: bool):
    clone["@file"] = clone["@file"][len(base_path + "/"):]
    if clone["@file"] not in map_clone[revision_id]:
        map_clone[revision_id][clone["@file"]] = dict()
    if int(clone["@pcid"]) not in map_clone[revision_id][clone["@file"]]:
        clone_info = CloneInfo(
            int(clone_class["@classid"]),
            int(clone["@pcid"]),
            clone["@file"],
            int(clone["@startline"]),
            int(clone["@endline"])
        )
        map_clone[revision_id][clone["@file"]][int(clone["@startline"])] = clone_info
        if new_global_id:
            assign_global_id(revision_id, clone_info)
        
def put_all_clones_into_map(clone_classes: dict, new_global_id: bool):
    if not isinstance(clone_classes, list):
        clone_classes = [clone_classes]
    for clone_class in clone_classes:
        if not isinstance(clone_class["source"], list):
            clone_class["source"] = [clone_class["source"]]
        for clone in clone_class["source"]:
            put_single_clone_into_map(clone_class, clone, new_global_id)

def generate_changed_file_list(change_log: Sequence[str]) -> Sequence[str]:
    changed_file_dict = collections.OrderedDict()
    for change in change_log:
        changed_file_dict[change.split(":")[0]] = None
    return list(changed_file_dict.keys())

def obtain_change_info_detail(change_record: str) -> ChangeInfo:
    change_record_split = change_record.split(":")
    return ChangeInfo(
        change_record_split[0],
        int(change_record_split[1]),
        change_record_split[2]
    )

def match_clones_in_previous_and_new_revisions(adjusted_start_line: int, adjusted_end_line: int, clone_in_previous_revision: CloneInfo, sorted_clone_key_in_previous_revision_in_changed_file: Sequence[int]) -> bool:
    done_for_current_clone = False
    sorted_clone_key_in_new_revision_in_changed_file = sorted(map_clone[revision_id][key_file].keys())
    for key_clone_in_new_revision in sorted_clone_key_in_new_revision_in_changed_file:
        clone_in_new_revision = map_clone[revision_id][key_file][key_clone_in_new_revision]
        if clone_in_new_revision.global_id >= 0:
            if sorted_clone_key_in_new_revision_in_changed_file[-1] == key_clone_in_new_revision:
                done_for_current_clone = True
        # if the calculated line number matches with a clone in the new revision
        # TODO for now it is an exact matching, may be improved
        elif clone_in_new_revision.start_line == adjusted_start_line and clone_in_new_revision.end_line == adjusted_end_line:
            assign_global_id(revision_id, clone_in_new_revision, clone_in_previous_revision)
            # if this is not the last clone in the previous revison or this is the last clone in the new revision
            if sorted_clone_key_in_previous_revision_in_changed_file[-1] != clone_in_previous_revision.start_line or sorted_clone_key_in_new_revision_in_changed_file[-1] == key_clone_in_new_revision:
                done_for_current_clone = True
        # if there is a new clone before the range we are looking for
        elif clone_in_new_revision.start_line < adjusted_start_line:
            assign_global_id(revision_id, clone_in_new_revision)
        # if not found
        else:
            # if this is the last clone in the previous revision in the changed file
            if sorted_clone_key_in_previous_revision_in_changed_file[-1] == clone_in_previous_revision.start_line:
                assign_global_id(revision_id, clone_in_new_revision)
                # if this is the last clone in the new revision in the changed file
                if sorted_clone_key_in_new_revision_in_changed_file[-1] == key_clone_in_new_revision:
                    done_for_current_clone = True
            else:
                done_for_current_clone = True
        if done_for_current_clone:
            break
    return done_for_current_clone

def handle_single_change_record(change_log: Sequence[str], clone_in_previous_revision: CloneInfo, sorted_clone_key_in_previous_revision_in_changed_file: Sequence[int], line_offset: int, clone_line_offset: int) -> (int, int, bool):
    done_for_current_clone = False
    change_info = obtain_change_info_detail(change_log.pop(0))
    is_change_info_still_in_same_file = change_info.file_path == clone_in_previous_revision.file

    # this is the last line of the change log, add a fake record to continue to process 
    if is_change_info_still_in_same_file and len(change_log) <= 0:
        change_log.insert(0, str(ChangeInfo(" ", 0, " ")))

    adjusted_start_line = clone_in_previous_revision.start_line + line_offset
    adjusted_end_line = clone_in_previous_revision.end_line + line_offset + clone_line_offset

    # before the clone's range
    if is_change_info_still_in_same_file and change_info.line <= adjusted_start_line:
        if change_info.operation == "+":
            line_offset += 1
        elif change_info.operation == "-":
            line_offset -= 1
    # in the clone's range
    elif is_change_info_still_in_same_file and change_info.line <= adjusted_end_line + 1:
        if change_info.operation == "+":
            clone_line_offset += 1
        elif change_info.operation == "-":
            clone_line_offset -= 1
        clone_in_previous_revision.change_count += 1
    # after the clone's range
    else:
        # insert the popped item back
        change_log.insert(0, str(change_info))
        done_for_current_clone = match_clones_in_previous_and_new_revisions(adjusted_start_line, adjusted_end_line, clone_in_previous_revision, sorted_clone_key_in_previous_revision_in_changed_file)

    return (line_offset, clone_line_offset, done_for_current_clone)

def handle_changed_file_conatains_clones_in_previous_and_new_revisions():
    line_offset = 0
    clone_line_offset = 0

    processing_started = False
    sorted_clone_key_in_previous_revision_in_changed_file = sorted(map_clone[revision_id - 1][key_file].keys())
    for key_clone_in_previous_revision in sorted_clone_key_in_previous_revision_in_changed_file:
        clone_in_previous_revision = map_clone[revision_id - 1][key_file][key_clone_in_previous_revision]

        line_offset += clone_line_offset
        clone_line_offset = 0

        done_for_current_clone = False
        # for each change record
        while len(change_log) > 0:
            if done_for_current_clone:
                break
            file_path = obtain_change_info_detail(change_log[0]).file_path
            if not processing_started and file_path != " " and file_path != clone_in_previous_revision.file:
                # ignore unnecessary logs
                change_log.pop(0)
                continue

            processing_started = True
            (line_offset, clone_line_offset, done_for_current_clone) = handle_single_change_record(change_log, clone_in_previous_revision, sorted_clone_key_in_previous_revision_in_changed_file, line_offset, clone_line_offset)

def print_processing_revision(revision_id):
    print("Processing " + str(revision_id) + "...")

# Main scipt starts below

try:
    base_path = sys.argv[1]
    min_revision = int(sys.argv[2])
    max_revision = int(sys.argv[3])
    report_path = sys.argv[4]
    change_log_path = sys.argv[5]
    output_path = sys.argv[6]
except Exception:
    print("Argument help: <base-path> <min_revision> <max_revision> <report_path> <change_log_path> <output_path>")
    exit()

map_clone = dict()
map_global_id = dict()


revision_id = min_revision
print_processing_revision(revision_id)
clone_classes_node = obtain_clone_class_node(report_path, revision_id)
if clone_classes_node is not None:
    put_all_clones_into_map(clone_classes_node, new_global_id = True)

while revision_id < max_revision:
    # FOR DEBUGGING ONLY ->
    # if revision_id >= 2:
    #     for r in map_clone.keys():
    #         for f in map_clone[r].keys():
    #             for c in map_clone[r][f].keys():
    #                 if map_clone[r][f][c].global_id < 0:
    #                     print(str(revision_id) + ", " + f + ", " + str(c))
    # <- FOR DEBUGGING ONLY

    revision_id += 1
    print_processing_revision(revision_id)
    clone_classes_node = obtain_clone_class_node(report_path, revision_id)
    if clone_classes_node is not None:
        put_all_clones_into_map(clone_classes_node, new_global_id = False)
        
        change_log = file_to_string(change_log_path + "/" + str(revision_id)).split("\n")
        change_log = list(filter(lambda x: x != "", change_log))  # remove empty lines

        changed_file_list = generate_changed_file_list(change_log)
        new_revision_changed_file_list = list(filter(lambda x: x in map_clone[revision_id].keys(), changed_file_list))
        
        # for all file in the new revision
        for key_file in sorted(map_clone[revision_id].keys()):
            # if the file is changed
            if key_file in new_revision_changed_file_list:
                # if the file also contains clones in the previous revision
                if key_file in map_clone[revision_id - 1].keys():
                    handle_changed_file_conatains_clones_in_previous_and_new_revisions()
                # if the file does not contain clones in the previous revison
                else:
                    sorted_clone_key_in_new_revision_in_changed_file = sorted(map_clone[revision_id][key_file].keys())
                    for key_clone_in_new_revision in sorted_clone_key_in_new_revision_in_changed_file:
                        clone_in_new_revision = map_clone[revision_id][key_file][key_clone_in_new_revision]
                        assign_global_id(revision_id, clone_in_new_revision)
            # if the file is not changed
            else:
                for key_clone in map_clone[revision_id][key_file].keys():
                    clone_in_new_revision = map_clone[revision_id][key_file][key_clone]

                    # if the clone exists in the previous revision
                    if key_file in map_clone[revision_id - 1] and key_clone in map_clone[revision_id - 1][key_file] and map_clone[revision_id - 1][key_file][key_clone].end_line == clone_in_new_revision.end_line:
                        clone_from_previous_revision = map_clone[revision_id - 1][key_file][key_clone]
                        assign_global_id(revision_id, clone_in_new_revision, clone_from_previous_revision)
                    # if the clone does not exist in the previous revison (new clone)
                    else:
                        assign_global_id(revision_id, clone_in_new_revision)


try:
    shutil.rmtree(output_path)
except OSError:
    pass
finally:
    os.mkdir(output_path)

with open(output_path + '/clone_map.json', 'w+') as fp:
    json.dump(map_clone, fp)
with open(output_path + '/global_id_map.json', 'w+') as fp:
    json.dump(map_global_id, fp)

end = 0