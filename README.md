# A simple quiz experience to use inside of Learn

## How to use

1. Clone the repository
2. Add questions to the `questions.json` file
3. Run `node server.js` to start the server
4. Open `localhost:3000` in your browser

Note: the legacy way of doing it was `python server.py` but python does not support websockets out of the box where Node.js does.  So `server.py` is deprecated in favor of `server.js`.

## How to add questions

Questions are stored in the `questions.json` file. The questions are stored in an array of objects. Each object represents a question and has the following properties:

- `name`: The name of the question
- `title`: The title of the question
- `type`: The type of question 

See the [SurveyJS documentation](https://surveyjs.io/form-library/examples/text-entry-question/reactjs) for the different question types and their properties. There are a lot of them, so I won't go into detail here.

## How to run the solution
As the user interacts with the quiz, the answers are stored in the `answers.json` file. The answers are stored in an array of objects. Each object represents a question and has the following properties:

- `name`: The name of the question
- `value`: The value of the question
- `correctAnswer`: The correct answer to the question
- `isCorrect`: Whether the answer is correct

To run the solution, run `python format_answers.py`. This will read the `questions.json` and `answers.json` files and format the answers into a human readable format.

## How to display the correct/incorrect state to the user
First, you must use the `node` version of the server (`server.js`). It exposes a websocket and a `/validate` endpoint you can POST to. It will request the HTML to annotate the UX.

If you want the Web UX to display the correct/incorrect state to the user, you can make a request to the quiz server:
```
curl -X POST localhost:3000/validate &> /dev/null
```

## How to use as a standalone solution

The 2 main dependencies required for this project are python and node. Both can be gotten in the python base images, since every base image contains node as well. A few files need to be created to make the solution work standalone.

An example can be found [here](https://app-staging.codesignal.dev/question/NzuLaf2PfcWuxhmAD/)
### setup.sh

```bash
#!/bin/sh
echo "Setting up environment…"

# Download the specified version (v0.7) of the repository as a tar.gz file
wget https://github.com/CodeSignal/learn_quiz-task/archive/refs/tags/v0.7.tar.gz >/dev/null 2>&1

# Extract the contents of the downloaded archive
tar xvf v0.7.tar.gz >/dev/null 2>&1

# move all the files to the root of the solution structure
mv ./learn_quiz-task-0.7/* ./ >/dev/null 2>&1

# delete the files/folders used as intermediate steps
rm -rf learn_quiz-task-0.7/ >/dev/null 2>&1
rm v0.7.tar.gz >/dev/null 2>&1

# assuming the questions are located under .codesignal/solution.json,
# move and rename them so the quiz app picks them up
cp .codesignal/solution.json questions.json >/dev/null 2>&1

# Install dependencies (ws in particular)
mkdir -p ~/node_modules
ln -sf ~/node_modules .
echo "Installing dependencies..."
npm i ws >/dev/null 2>&1

touch /tmp/.setup_finished
echo "Setup complete."
echo "Running quiz..."
# run the node server to display the quiz on port 3000
node server.js
```

### run_solution.sh

```bash
#!/bin/bash

# force all clients (just the one for the preview window) to update 
# their display and show the correctness of the answers
curl -X POST localhost:3000/validate &> /dev/null

# process the answers given to assess if the learner correctly 
# completed the quiz
python3 format_answers.py

exit 0
```

## FAQ

### my questions aren't showing up in the survey
Are you sure you didn't store your particular questions in a path different than the one used in the `setup.sh` file?

### I'm getting errors after copying the exact scripts provided here
Ensure you are using the latest release of this repository. While the script assume version 0.7, it could very well be that a bug was fixed somewhere down the line and a newer release fixes the issues.