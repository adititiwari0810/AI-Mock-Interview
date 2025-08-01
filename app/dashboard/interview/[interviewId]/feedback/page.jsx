"use client"
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {ChevronsUpDown} from 'lucide-react'
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
 
const Feedback = ({params}) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const router = useRouter()
  
  useEffect(() => {
    GetFeedback();
  }, [])
  
  // const GetFeedback = async () => {
  //   const result = await db.select()
  //   .from(UserAnswer)
  //   .where(eq(UserAnswer.mockIdRef, params.interviewId))
  //   .orderBy(UserAnswer.id);
  //   console.log("🚀 ~ file: page.jsx:11 ~ GetFeedback ~ result:", result);
  //   setFeedbackList(result);
    
  //   // Calculate dynamic rating based on available feedback
  //   if (result.length > 0) {
  //     const totalRating = result.reduce((sum, item) => sum + (item.rating || 0), 0);
  //     let avg = totalRating / result.length;
  //     avg = Math.min(10, Math.max(0, avg)); // Clamp between 0 and 10
  //     setAverageRating(avg.toFixed(1)); // 1 decimal place
  //   } else {
  //     setAverageRating(null); // No feedback available
  //   }
  // }
  const GetFeedback = async () => {
  // 1. Get all questions for this interview
  const interviewResult = await db
    .select()
    .from(MockInterview)
    .where(eq(MockInterview.mockId, params.interviewId));
  const questions = JSON.parse(interviewResult[0].jsonMockResp);

  // 2. Get all user answers for this interview
  const answers = await db
    .select()
    .from(UserAnswer)
    .where(eq(UserAnswer.mockIdRef, params.interviewId))
    .orderBy(UserAnswer.id);

  setFeedbackList(answers);

  // 3. Map answers to questions, fill missing with 0
  let totalScore = 0;
  for (let i = 0; i < questions.length; i++) {
    const questionText = questions[i].question;
    const answer = answers.find(a => a.question === questionText);
    totalScore += answer && answer.rating ? Number(answer.rating) : 0;
  }

  // 4. Calculate average
  const avg = questions.length > 0 ? totalScore / questions.length : 0;
  setAverageRating(avg.toFixed(1));
}
 
  return (
    <div className='p-10'>
      <h2 className='text-3xl font-bold text-green-600'>Congratulations!</h2>
      <h2 className='font-bold text-2xl'>Here is your interview feedback</h2>
      {feedbackList?.length === 0 ? (
        <h2 className='font-bold text-lg text-green-500'>No interview Feedback</h2>
      ) : (
        <>
          <h2 className='text-primary text-lg my-2'>
            Your overall interview rating: <strong>{averageRating}/10</strong>
          </h2>
          <h2 className='text-sm text-gray-500'>Find below interview questions with coreect answers,Your answer and feedback for improvements for your next interview</h2>
          {feedbackList && feedbackList.map((item, index) => (
            <Collapsible key={index} className='mt-7'>
              <CollapsibleTrigger className='p-2 flex justify-between bg-secondary rounded-lg my-2 text-left gap-7 w-full'>
                {item.question} <ChevronsUpDown className='h-4'/>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='flex flex-col gap-2'>
                  <h2 className='text-red-500 p-2 border rounded-lg'>
                    <strong>
                      Rating:
                    </strong>
                    {item.rating}
                  </h2>
                  <h2 className='p-2 border rounded-lg bg-red-50 text-sm text-red-900'><strong>Your Answer: </strong>{item.userAns}</h2>
                  <h2 className='p-2 border rounded-lg bg-green-50 text-sm text-green-900'><strong>Correct Answer Looks Like: </strong>{item.correctAns}</h2>
                  <h2 className='p-2 border rounded-lg bg-blue-50 text-sm text-primary'><strong>Feedback: </strong>{item.feedback}</h2>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </>
      )}
      <Button className='mt-5' onClick={() => router.replace('/dashboard')}> Go Home</Button>
    </div>
  );
}

export default Feedback;