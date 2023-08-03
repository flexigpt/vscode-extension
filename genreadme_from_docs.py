import sys
import os
import re

def sequentialize_header_priorities(header_priority_pairs):
    for i in range(len(header_priority_pairs) - 1):
        header, priority = header_priority_pairs[i]
        next_header, next_priority = header_priority_pairs[i + 1]
        if (next_priority - priority > 1):
            header_priority_pairs[i + 1] = (next_header, priority + 1)
    return header_priority_pairs

def create_github_header_anchor(header_title):
    return '[{}](#{})'.format(header_title, header_title.strip().replace(' ', '-'))

def generate_github_toc(md_text, max_priority=3, toc_title='# Table of Contents'):
    lines_iter = iter(md_text.splitlines())
    header_priority_pairs = []
    in_code_block = False
    for line in lines_iter:
        if line.startswith('```'):
            in_code_block = not in_code_block
        elif not in_code_block and line.startswith('#') and ' ' in line:
            md_header, header_title = line.split(' ', 1)
            if md_header != md_header[0] * len(md_header) or len(md_header) > max_priority:
                continue
            if header_title.lower() != 'table of contents' and len(header_title) > 1:
                header_priority_pairs.append((header_title, len(md_header)))

    header_priority_pairs = sequentialize_header_priorities(header_priority_pairs)
    if len(header_priority_pairs) == 0:
        return None
    bullet_list = [toc_title, '']  # Added a blank line after toc_title
    highest_priority = min(header_priority_pairs, key=lambda pair: pair[1])[1]
    for header, priority in header_priority_pairs:
        md_anchor = create_github_header_anchor(header)
        bullet_list.append('\t' * (priority - highest_priority) + '* ' + md_anchor)

    return '\n'.join(bullet_list)

def read_file(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    return content

def write_file(file_path, content):
    with open(file_path, 'w') as file:
        file.write(content)

def process_input_file(input_file_path):
    input_content = read_file(input_file_path)
    output_content = ""

    lines = input_content.split('\n')
    for line in lines:
        if line.startswith('- [**'):
            title_start_index = line.find('[') + 3
            title_end_index = line.find('**]')
            title = line[title_start_index:title_end_index]
            link_start_index = line.find('(') + 1
            link_end_index = line.find(')')
            link = line[link_start_index:link_end_index]

            if link == '/':
                # Get the directory of the input file
                input_directory = os.path.dirname(input_file_path)
                # Check if readme.md or README.md exists in the same directory
                readme_files = [f for f in os.listdir(input_directory) if f.lower() == 'readme.md']
                if readme_files:
                    readme_content = read_file(os.path.join(input_directory, readme_files[0]))
                    output_content += f"# {title}\n\n{readme_content}\n\n"
            else:
                file_name = link.split('/')[-1]
                if file_name.endswith('.md'):
                    # Get the directory of the input file
                    input_directory = os.path.dirname(input_file_path)
                    # Construct the path to the section file relative to the input directory
                    section_file_path = os.path.join(input_directory, file_name)
                    section_content = read_file(section_file_path)
                    output_content += f"# {title}\n\n{section_content}\n\n"

    return output_content

def merge_files(input_file_path, destination_file_path):
    marker_found = False
    destination_content = ""
    
    with open(destination_file_path, 'r') as destination_file:
        for line in destination_file:
            if not marker_found and line.strip() == '---':
                marker_found = True
                destination_content += line + '\n'
                newout = process_input_file(input_file_path)
                
                toc = generate_github_toc(newout)
                destination_content += toc + '\n\n' + newout + '\n'
            
            if marker_found:
                break
            
            destination_content += line
    
    write_file(destination_file_path, destination_content)


if __name__ == '__main__':
    # Example usage
    if len(sys.argv) < 3:
        # python3 ./genreadme_from_docs.py ./docs/_sidebar.md ./README.md   
        print("Usage: python script.py <input_file_path> <destination_file_path>")
    else:
        input_path = sys.argv[1]
        destination_path = sys.argv[2]
        merge_files(input_path, destination_path)
