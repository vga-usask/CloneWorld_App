# show help of arguments
if [ $# -eq 0 ] || [ $1 == "-h" ] || [ $1 == "--help" ]
then granularity
  echo "Argument help: <SOURCE_DIRECTORY> <SOURCE_BRANCH_NAME> <NICAD_DIRECTORY> <NICAD_GRANULARITY> <NICAD_LANG> <OUTPUT_PATH>"
  exit 0
fi

SOURCE_DIRECTORY=$1
SOURCE_BRANCH_NAME=$2
NICAD_DIRECTORY=$3
NICAD_GRANULARITY=$4
NICAD_LANG=$5
OUTPUT_PATH=$6

NICAD_SYSTEMS_DIRECTORY=$NICAD_DIRECTORY/systems

# TODO check make, gcc, txl

# check if NiCad has been compiled; if not, compile it with make
if [ ! -x $NICAD_DIRECTORY/tools/clonepairs.x ]
then
  echo "Compiling NiCad..." && (cd $NICAD_DIRECTORY && make > /dev/null 2>&1) 
fi

# delete and re-create tempoorary folders
if [ -d temp ]
then
  rm -rf temp
fi
mkdir temp
if [ -d temp/reports ]
then
  rm -rf temp/reports
fi
mkdir temp/reports
if [ -d temp/changes ]
then
  rm -rf temp/changes
fi
mkdir temp/changes
if [ -d "$NICAD_SYSTEMS_DIRECTORY" ]
then
  rm -rf "$NICAD_SYSTEMS_DIRECTORY"
fi
mkdir "$NICAD_SYSTEMS_DIRECTORY"

# get the revision list
(cd $SOURCE_DIRECTORY && git checkout $SOURCE_BRANCH_NAME > /dev/null 2>&1 && git log --oneline | cut -d ' ' -f 1) > temp/revisions


format-git-diff() {
  local path=
  local line=
  while read
  do
    esc=$'\033'
    if [[ $REPLY =~ ---\ (a/)?.* ]]
    then
      continue
    elif [[ $REPLY =~ \+\+\+\ (b/)?([^[:blank:]$esc]+).* ]]
    then
      path=${BASH_REMATCH[2]}
    elif [[ $REPLY =~ @@\ -[0-9]+(,[0-9]+)?\ \+([0-9]+)(,[0-9]+)?\ @@.* ]]
    then
      line=${BASH_REMATCH[2]}
    elif [[ $REPLY =~ ^($esc\[[0-9;]+m)*([\ +-]) ]]
    then
      echo "$path:$line:$REPLY"
      if [[ ${BASH_REMATCH[2]} != - ]]
      then
        ((line++))
      fi
    fi
  done |
  while IFS= read -r LINE
  do
    IFS=': ' read -a PARTS <<< "$LINE"
    if [[ ${PARTS[2]:0:1} == "+" ]] || [[ ${PARTS[2]:0:1} == "-" ]]
    then
      echo "${PARTS[0]}:${PARTS[1]}:${PARTS[2]:0:1}"
    fi
  done
}

# git diff 1d02cd4 6c4fd0e | format-git-diff
# 739 - 22 - 1d02cd4
# 740 - 21 - 6c4fd0e

INPUT_FILE_PATH="temp/revisions"
REVISION_ID=$(wc -l < $INPUT_FILE_PATH)
while IFS= read -r COMMIT_ID
do
  REVISION_ID=`expr $REVISION_ID - 1`
  echo "Processing $REVISION_ID, $COMMIT_ID..."
  (cd $SOURCE_DIRECTORY && git checkout $COMMIT_ID) > /dev/null 2>&1
  cp -r $SOURCE_DIRECTORY "$NICAD_SYSTEMS_DIRECTORY/source" 
  # (cd $NICAD_DIRECTORY && "./nicad5" $4NICAD_GRANULARITY $NICAD_LANG "systems/source" type1) > /dev/null 2>&1
  # cp "$NICAD_SYSTEMS_DIRECTORY/source_functions-clones/source_functions-clones-0.00-classes.xml" "temp/reports/$REVISION_ID"
  (cd $NICAD_DIRECTORY && "./nicad5" $NICAD_GRANULARITY $NICAD_LANG "systems/source" default) > /dev/null 2>&1
  if [ -f "$NICAD_SYSTEMS_DIRECTORY/source_functions-blind-clones/source_functions-blind-clones-0.30-classes.xml" ]
  then
    cp "$NICAD_SYSTEMS_DIRECTORY/source_functions-blind-clones/source_functions-blind-clones-0.30-classes.xml" "temp/reports/$REVISION_ID"
  else
    touch "temp/reports/$REVISION_ID"
  fi
  
  rm -rf "$NICAD_SYSTEMS_DIRECTORY"
  mkdir "$NICAD_SYSTEMS_DIRECTORY"
done < $INPUT_FILE_PATH


REVISION_COUNT=$(wc -l < $INPUT_FILE_PATH)
REVISION_ID=$REVISION_COUNT
PREVIOUS_COMMIT_ID=

while IFS= read -r COMMIT_ID
do
  if [[ $PREVIOUS_COMMIT_ID ]]
  then
    echo "Generating change log for revision $REVISION_ID ($COMMIT_ID $PREVIOUS_COMMIT_ID)..."
    (cd $SOURCE_DIRECTORY && git diff $COMMIT_ID $PREVIOUS_COMMIT_ID) | format-git-diff > "temp/changes/$REVISION_ID"
  fi
  REVISION_ID=`expr $REVISION_ID - 1`
  PREVIOUS_COMMIT_ID=$COMMIT_ID
done < $INPUT_FILE_PATH

python3 ./mapping.py "systems/source" 0  `expr $REVISION_COUNT - 1` "temp/reports" "temp/changes" $OUTPUT_PATH
