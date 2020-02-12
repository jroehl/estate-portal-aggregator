#!/usr/bin/env bash

# exit when any command fails
set -e

function main() {
  for i in "$@"; do
    case $i in
    -t=* | --target=*)
      target_lang="${i#*=}"
      shift # past argument=value
      ;;
    -s=* | --source=*)
      source_lang="${i#*=}"
      shift # past argument=value
      ;;
    -e=* | --engine=*)
      engine="${i#*=}"
      shift # past argument=value
      ;;
    *)
      input_file=${i#*=}
      ;;
    esac
  done
  declare -a translated_dictionary

  engine=${engine:-"yandex"}

  input_name="$(echo ${input_file##*/})"
  output_name="${input_name/.json/-translated-to-${target_lang}.json}"

  echo "Translating file \"${input_name}\" from \"${source_lang}\" to \"${target_lang}\""

  rows=$(cat "${input_file}" | jq -r 'to_entries[] | @base64')
  for row in ${rows}; do
    _jq() {
      echo ${row} | base64 --decode | jq -r "${1}"
    }
    local key=$(_jq '.key')
    local value=$(_jq '.value')
    translation=$(trans -b -e ${engine:-"bing"} -s ${source_lang} -t ${target_lang} "${value}")
    echo "Translated \"${value}\" > \"${translation}\""
    translated_dictionary+=("{ \"${key}\": \"${translation}\" }")
  done
  result=$(echo ${translated_dictionary[@]} | jq -s ". | add")

  output_file="${input_file/${input_name}/${output_name}}"
  echo "${result}" | jq '.' >"${output_file}"

  echo "Translation stored at \"${output_file}\""
}

main "$@"
