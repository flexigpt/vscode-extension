import sys
import os
import mdformat


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
                destination_content += mdformat.text(newout, options={"wrap": 80}) + '\n'
            
            if marker_found:
                break
            
            destination_content += line
    
    write_file(destination_file_path, destination_content)


if __name__ == '__main__':
    # Example usage
    if len(sys.argv) < 3:
        print("Usage: python script.py <input_file_path> <destination_file_path>")
    else:
        input_path = sys.argv[1]
        destination_path = sys.argv[2]
        merge_files(input_path, destination_path)
