
import { GoogleGenAI } from "@google/genai";
import { Tenant, Payment } from "../types";

export const generateReminderMessage = async (tenant: Tenant, payment: Payment): Promise<string> => {
  // Always create a new instance right before the call to ensure the latest API key is used
  // Assume process.env.API_KEY is pre-configured and accessible.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Draft a professional yet friendly rent reminder for a student tenant.
    Tenant Name: ${tenant.name}
    Property Address context: Private Student Accommodation
    Amount Due: R${payment.amount}
    Due Date: ${payment.dueDate}
    Tone: Helpful, polite, but firm about the deadline. Mention that as students, managing finances is hard but timely payment is crucial for house maintenance.
    Keep it concise and suitable for an email or WhatsApp message.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    // Using the .text property directly as per Gemini 3 SDK guidelines
    return response.text || `Hi ${tenant.name}, this is a reminder that your rent of R${payment.amount} was due on ${payment.dueDate}. Please ensure this is paid as soon as possible. Thank you!`;
  } catch (error) {
    console.error("Error generating reminder:", error);
    // Fallback message if the API call fails or safety filters trigger
    return `Hi ${tenant.name}, this is a reminder that your rent of R${payment.amount} was due on ${payment.dueDate}. Please ensure this is paid as soon as possible. Thank you!`;
  }
};
