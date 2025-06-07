import React, { useState, useEffect } from 'react';
import a1a3QuestionsData from './data/a1_a3_exam_questions.json';
import a2QuestionsData from './data/a2_exam_questions.json';

const ExamApp = () => {
  const [examType, setExamType] = useState<'A1_A3' | 'A2'>('A1_A3');
  const [questions, setQuestions] = useState<{
    question: string;
    options: { text: string; correct: boolean; }[];
  }[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [completedQuestionIndices, setCompletedQuestionIndices] = useState(new Set());
  const [wrongAnswerIndices, setWrongAnswerIndices] = useState<number[]>([]);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: [
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false },
      { text: "", correct: false }
    ]
  });
  const [view, setView] = useState("quiz"); // "quiz", "add", "manage"
  const [showOnlyWrongAnswers, setShowOnlyWrongAnswers] = useState(false);

  // Initialize or load questions and state
  useEffect(() => {
    // Initialize with JSON file questions or try to load from localStorage
    const savedQuestions = localStorage.getItem(`easaExamQuestions_${examType}`);
    if (savedQuestions) {
      try {
        const parsedQuestions = JSON.parse(savedQuestions);
        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          setQuestions(parsedQuestions);
          
          // Also load saved wrong answer indices if available
          const savedWrongAnswers = localStorage.getItem(`easaExamWrongAnswers_${examType}`);
          if (savedWrongAnswers) {
            try {
              const parsedWrongAnswers = JSON.parse(savedWrongAnswers);
              if (Array.isArray(parsedWrongAnswers)) {
                setWrongAnswerIndices(parsedWrongAnswers);
              }
            } catch (error) {
              console.error("Error parsing saved wrong answers:", error);
            }
          }
          
          return;
        }
      } catch (error) {
        console.error("Error parsing saved questions:", error);
      }
    }
    
    // If no saved questions or error parsing, use questions from JSON file
    const questionsData = examType === 'A1_A3' ? a1a3QuestionsData : a2QuestionsData;
    setQuestions(questionsData.map(q => ({
      question: q.question,
      options: q.answers.map(a => ({
        text: a.text,
        correct: a.correct
      }))
    })));
  }, [examType]);

  const handleExamTypeChange = (newExamType: 'A1_A3' | 'A2') => {
    setExamType(newExamType);
    
    // Reset all state when switching exam types
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setQuestionsAsked(0);
    setCompletedQuestionIndices(new Set());
    setWrongAnswerIndices([]);
    setView("quiz");
  };

  const getNextQuestion = () => {
    // If all questions have been asked at least once, reset the completed set
    if (completedQuestionIndices.size >= questions.length) {
      setCompletedQuestionIndices(new Set());
    }

    // Get indices of questions that haven't been asked yet
    const availableIndices = questions
      .map((_, index) => index)
      .filter(index => !completedQuestionIndices.has(index));

    // If no available indices, something's wrong - reset
    if (availableIndices.length === 0) {
      setCompletedQuestionIndices(new Set());
      return Math.floor(Math.random() * questions.length);
    }

    // Pick a random question from available indices
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    return availableIndices[randomIndex];
  };

  interface Question {
    question: string;
    options: Array<{
      text: string;
      correct: boolean;
    }>;
  }

  const handleAnswerSelect = (answerIndex: number): void => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const currentQuestion: Question = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[answerIndex].correct;
    
    if (isCorrect) {
      setScore(score + 1);
    } else {
      // Track wrong answers
      const updatedWrongAnswers = [...wrongAnswerIndices];
      if (!updatedWrongAnswers.includes(currentQuestionIndex)) {
        updatedWrongAnswers.push(currentQuestionIndex);
        setWrongAnswerIndices(updatedWrongAnswers);
        
        // Save to localStorage
        localStorage.setItem(`easaExamWrongAnswers_${examType}`, JSON.stringify(updatedWrongAnswers));
      }
    }
    
    // Add this question to the completed set
    const newCompleted: Set<number> = new Set(Array.from(completedQuestionIndices) as number[]);
    newCompleted.add(currentQuestionIndex);
    setCompletedQuestionIndices(newCompleted);
    
    setQuestionsAsked(questionsAsked + 1);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentQuestionIndex(getNextQuestion());
  };

  if (questions.length === 0) {
    return <div className="flex items-center justify-center h-screen text-xl">Loading questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Function to handle adding a new question
  const handleAddQuestion = () => {
    // Validate new question
    if (newQuestion.question.trim() === '') {
      alert('Please enter a question');
      return;
    }
    
    if (newQuestion.options.some(opt => opt.text.trim() === '')) {
      alert('Please fill in all answer options');
      return;
    }
    
    if (!newQuestion.options.some(opt => opt.correct)) {
      alert('Please mark at least one answer as correct');
      return;
    }
    
    // Add the new question to the list
    const updatedQuestions = [...questions, {...newQuestion}];
    setQuestions(updatedQuestions);
    
    // Save to localStorage
    localStorage.setItem(`easaExamQuestions_${examType}`, JSON.stringify(updatedQuestions));
    
    // Reset the form
    setNewQuestion({
      question: "",
      options: [
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false }
      ]
    });
    
    // Switch back to quiz view
    setView("quiz");
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index].text = value;
    setNewQuestion({...newQuestion, options: updatedOptions});
  };
  
  const handleCorrectChange = (index: number) => {
    const updatedOptions = newQuestion.options.map((opt, i) => ({
      ...opt,
      correct: i === index
    }));
    setNewQuestion({...newQuestion, options: updatedOptions});
  };
  
  const renderAddQuestionForm = () => {
    return (
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Add New Question</h2>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">Question:</label>
          <textarea 
            className="w-full p-2 border rounded" 
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium">Answer Options:</label>
          {newQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input 
                type="radio" 
                className="mr-2"
                checked={option.correct}
                onChange={() => handleCorrectChange(index)}
              />
              <input 
                type="text" 
                className="flex-grow p-2 border rounded" 
                value={option.text}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
          <p className="text-sm text-gray-500">Select the radio button next to the correct answer.</p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button 
            onClick={() => setView("quiz")} 
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button 
            onClick={handleAddQuestion} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Question
          </button>
        </div>
      </div>
    );
  };
  
  const renderQuestionManagement = () => {
    // Filter questions based on the toggle state
    const filteredQuestions = showOnlyWrongAnswers 
      ? questions.filter((_, index) => wrongAnswerIndices.includes(index))
      : questions;
    
    return (
      <div className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Manage Questions</h2>
        
        <div className="mb-4 flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={showOnlyWrongAnswers}
              onChange={() => setShowOnlyWrongAnswers(!showOnlyWrongAnswers)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium">Show only wrong answers ({wrongAnswerIndices.length})</span>
          </label>
        </div>
        
        {filteredQuestions.length === 0 ? (
          <p className="text-center py-4">
            {showOnlyWrongAnswers 
              ? "No wrong answers tracked yet. Complete the quiz to track wrong answers."
              : "No questions available. Add some questions to get started."}
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredQuestions.map((q, idx) => {
              // Get the actual index in the questions array
              const index = showOnlyWrongAnswers ? wrongAnswerIndices[idx] : idx;
              
              return (
                <div key={index} className="p-3 border rounded">
                  <p className="font-medium">
                    <span className="mr-2">{index + 1}.</span>
                    {q.question}
                    {wrongAnswerIndices.includes(index) && 
                      <span className="ml-2 text-xs font-normal text-red-500">
                        (Answered incorrectly)
                      </span>
                    }
                  </p>
                  <div className="mt-2 text-sm">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`${opt.correct ? "text-green-600 font-medium" : ""}`}>
                        {i+1}. {opt.text} {opt.correct && " ✓"}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex justify-between mt-4">
          {wrongAnswerIndices.length > 0 && (
            <button 
              onClick={() => {
                setWrongAnswerIndices([]);
                localStorage.removeItem(`easaExamWrongAnswers_${examType}`);
              }} 
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Wrong Answers
            </button>
          )}
          <button 
            onClick={() => setView("quiz")} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ml-auto"
          >
            Back to Quiz
          </button>
        </div>
      </div>
    );
  };

  // Main app views
  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-center mb-2">EASA {examType.replace('_', '/')} Exam Practice</h1>
        
        {/* Exam Type Selector */}
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-lg p-1 inline-flex">
            <button
              onClick={() => handleExamTypeChange('A1_A3')}
              className={`px-4 py-2 rounded ${
                examType === 'A1_A3' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              A1/A3 Exam
            </button>
            <button
              onClick={() => handleExamTypeChange('A2')}
              className={`px-4 py-2 rounded ${
                examType === 'A2' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              A2 Exam
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-center space-x-2 mb-4">
          <button 
            onClick={() => setView("quiz")} 
            className={`px-3 py-1 rounded ${view === "quiz" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Quiz
          </button>
          <button 
            onClick={() => setView("add")} 
            className={`px-3 py-1 rounded ${view === "add" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Add Question
          </button>
          <button 
            onClick={() => setView("manage")} 
            className={`px-3 py-1 rounded ${view === "manage" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Manage Questions
          </button>
        </div>
        
        {/* Progress info - only shown in quiz view */}
        {view === "quiz" && questions.length > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <p>Questions: {questionsAsked}/{questions.length}</p>
              <p>Score: {score}/{questionsAsked}</p>
              <p>Wrong: {wrongAnswerIndices.length}</p>
              <p>Completion: {Math.round((completedQuestionIndices.size / questions.length) * 100)}%</p>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${(completedQuestionIndices.size / questions.length) * 100}%` }}
              ></div>
            </div>
          </>
        )}
      </div>

      {/* Content based on current view */}
      {view === "add" && renderAddQuestionForm()}
      {view === "manage" && renderQuestionManagement()}
      
      {view === "quiz" && questions.length > 0 && (
        <>
          <div className="mb-6 p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Question {currentQuestionIndex + 1}:</h2>
            <p className="mb-4">{currentQuestion.question}</p>

            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`w-full p-3 text-left rounded border ${
                    isAnswered
                      ? option.correct
                        ? 'bg-green-100 border-green-500'
                        : selectedAnswer === index
                        ? 'bg-red-100 border-red-500'
                        : 'border-gray-300'
                      : selectedAnswer === index
                      ? 'bg-blue-100 border-blue-500'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {option.text}
                  {isAnswered && option.correct && (
                    <span className="float-right text-green-600">✓</span>
                  )}
                  {isAnswered && !option.correct && selectedAnswer === index && (
                    <span className="float-right text-red-600">✗</span>
                  )}
                </button>
              ))}
            </div>
          </div>

            {isAnswered && selectedAnswer !== null && (
          <div className="text-center">
            <div className="mb-4">
              {currentQuestion.options[selectedAnswer].correct ? (
                <p className="text-green-600 font-bold">Correct!</p>
              ) : (
                <p className="text-red-600 font-bold">
                  Incorrect. The correct answer is: {currentQuestion.options.find(opt => opt.correct)?.text || 'Not found'}
                </p>
              )}
            </div>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Next Question
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>EASA Exam Practice App</p>
        <a
          href="https://dronelab.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-blue-500 hover:text-blue-700"
        >
          [Brought to you by dronelab.dev]
        </a>
      </div>
    </div>
  );
};

export default ExamApp;