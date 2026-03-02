import json
import os
from pathlib import Path

def optimize_notebook(notebook_path):
    """
    Optimize Jupyter notebook for GitHub preview by:
    1. Removing large cell outputs
    2. Clearing metadata
    3. Keeping code and markdown cells intact
    """
    
    with open(notebook_path, 'r', encoding='utf-8') as f:
        notebook = json.load(f)
    
    print(f"Original file size: {os.path.getsize(notebook_path) / 1024 / 1024:.2f} MB")
    
    # Clear notebook-level metadata
    if 'metadata' in notebook:
        notebook['metadata'] = {
            'kernelspec': notebook['metadata'].get('kernelspec', {}),
            'language_info': notebook['metadata'].get('language_info', {})
        }
    
    # Process cells
    cells_kept = 0
    cells_removed = 0
    
    for cell in notebook.get('cells', []):
        # Keep code and markdown cells
        if cell.get('cell_type') in ['code', 'markdown']:
            cells_kept += 1
            
            # Clear large outputs
            if cell.get('cell_type') == 'code':
                output_data = []
                for output in cell.get('outputs', []):
                    # Keep only text outputs, remove large outputs
                    if output.get('output_type') == 'stream':
                        output_data.append(output)
                    elif output.get('output_type') == 'display_data':
                        # Keep only small text representations
                        if 'text/plain' in output.get('data', {}):
                            output_data.append({
                                'output_type': 'display_data',
                                'data': {
                                    'text/plain': output['data']['text/plain']
                                },
                                'metadata': {}
                            })
                    elif output.get('output_type') == 'execute_result':
                        if 'text/plain' in output.get('data', {}):
                            output_data.append({
                                'output_type': 'execute_result',
                                'data': {
                                    'text/plain': output['data']['text/plain']
                                },
                                'metadata': {},
                                'execution_count': output.get('execution_count')
                            })
                
                cell['outputs'] = output_data
            
            # Clear cell metadata
            cell['metadata'] = {}
        else:
            cells_removed += 1
    
    notebook['cells'] = [c for c in notebook.get('cells', []) if c.get('cell_type') in ['code', 'markdown']]
    
    # Save optimized notebook
    output_path = notebook_path.replace('.ipynb', '_optimized.ipynb')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(notebook, f, indent=1)
    
    new_size = os.path.getsize(output_path) / 1024 / 1024
    print(f"Optimized file size: {new_size:.2f} MB")
    print(f"Size reduction: {(1 - new_size / (os.path.getsize(notebook_path) / 1024 / 1024)) * 100:.1f}%")
    print(f"Cells kept: {cells_kept}, Non-code cells removed: {cells_removed}")
    print(f"Saved to: {output_path}")
    
    return output_path

if __name__ == "__main__":
    notebook_path = "Phase2_EDA_UIKD_SSCD.ipynb"
    if os.path.exists(notebook_path):
        optimize_notebook(notebook_path)
        print("\n✅ Notebook optimization complete!")
        print("Run this command to replace the original:")
        print(f"  mv {notebook_path.replace('.ipynb', '_optimized.ipynb')} {notebook_path}")
    else:
        print(f"❌ File not found: {notebook_path}")
