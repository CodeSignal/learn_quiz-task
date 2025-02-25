import json

# Load the JSON files
try:
    with open('questions.json', 'r') as f:
        questions_data = json.load(f)
except:
    print("Error: Cannot find questions.json file")
    exit(1)

try:
    with open('answers.json', 'r') as f:
        answers_data = json.load(f)
except:
    answers_data = {}

print(f"# Quiz Results")

print(f"The user was asked the folling questions. A response of 'NO RESPONSE' indicates that the user did not respond to the question.\n")

# Calculate total questions and number correct
total_questions = len(questions_data['elements'])
correct_answers = sum(1 for answer in answers_data.values() if answer.get('isCorrect', False))

print(f"## SCORE:\n{correct_answers} out of {total_questions} questions correct ({(correct_answers/total_questions)*100:.1f}%)\n")
print(f"## QUESTIONS:\n")

# Create a dictionary mapping question names to their titles and correct answers
questions = {
    q['name']: {
        'title': q['title'],
        'correctAnswer': q.get('correctAnswer', 'Unknown')
    } for q in questions_data['elements']
}

# Format and display each question with its answer
for q_name, q_info in questions.items():
    print(f"### {q_info['title']}")
    
    # Get the corresponding answer if it exists
    answer_data = answers_data.get(q_name, {})
    user_answer = answer_data.get('value', 'NO RESPONSE')
    expected_answer = q_info['correctAnswer']  # Get correct answer from questions data
    is_correct = answer_data.get('isCorrect', False)
    
    # Print formatted results
    print(f"- user response: {user_answer}")
    print(f"- expected response: {expected_answer}")
    print(f"- is correct? {'yes' if is_correct else 'no'}")
    print("")
