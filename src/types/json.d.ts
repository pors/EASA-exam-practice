declare module "*.json" {
  const value: {
    questions: Array<{
      question: string;
      options: Array<{
        text: string;
        correct: boolean;
      }>;
    }>;
  };
  export default value;
}
