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
if [ -f questions.json ]; then
    wget https://github.com/CodeSignal/learn_quiz-task/releases/latest/download/dist.tar.gz
    
    mkdir -p learn_quiz
    cd learn_quiz
    tar xzf ../dist.tar.gz 
    
    cp ../questions.json questions.json
    
    npm start
    exit 0
fi
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

### Questions.json Format
This is the format used by Survey.js and an example is in `questions.json`. But we sometimes want to use Markdown to define the questions (example: `questions.md`). You can convert the Markdown to JSON if you prefer.  In that case, you can convert it to JSON:

```bash
node convert-questions-md-to-json.js -i questions.md -o questions.json
```

### View settings

The expected setup in the view settings (present either on the course level or on the task level):
- Task Preview: "Full Screen"
- Task Preview URL Header: "Hidden"
- Refresh Preview on Run: "Disabled"
- Preview Loading Message: "Custom"
- Custom Preview Loading Message: "Starting Quiz..."
- Reset Session Button Location: "Preview"
- Preview Position: "top:10px; right:10px"

## FAQ

### my questions aren't showing up in the survey
Are you sure you didn't store your particular questions in a path different than the one used in the `setup.sh` file?

### I'm getting errors after copying the exact scripts provided here
Ensure you are using the latest release of this repository. While the script assume version 0.7, it could very well be that a bug was fixed somewhere down the line and a newer release fixes the issues.
