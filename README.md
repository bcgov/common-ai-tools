# steps

- create python environment - https://code.visualstudio.com/docs/python/python-tutorial

- install from requirement.txt file: `pip install -r /path/to/requirements.txt`
- run `pip install "unstructured[md]"`

- add a .env file to root with OPEN_API_KEY=<your key from openai>

- run `create_datatbase.py` to save data as 'dcuments' in the chroma db

- run `query_data.py "why should i self-host COMS?"` for an example
note: I needed to edit this file to include the open-ai-key from the environment variable.