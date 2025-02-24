# A simple quiz experience to use inside of Learn

## How to use

1. Clone the repository
2. Add questions to the `questions.json` file
3. Run `python server.py` to start the server
4. Open `localhost:3000` in your browser

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

