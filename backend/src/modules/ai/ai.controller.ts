import { Request, Response } from 'express';
import { aiService } from './ai.service';
import { sendSuccess } from '../../common/utils/responseFormatter';

export class AiController {
  async askTutor(req: Request, res: Response) {
    const result = await aiService.askTutor(req.user!.id, req.body);
    return sendSuccess(res, 'AI response generated successfully', result);
  }

  async generateQuiz(req: Request, res: Response) {
    const result = await aiService.generateQuiz(req.body);
    return sendSuccess(res, 'AI Quiz questions generated successfully', result);
  }

  async summarizeNotes(req: Request, res: Response) {
    const result = await aiService.summarizeNotes(req.body);
    return sendSuccess(res, 'Notes summarized successfully', result);
  }

  async generateStudyPlan(req: Request, res: Response) {
    const result = await aiService.generateStudyPlan(req.body);
    return sendSuccess(res, 'AI Study plan generated successfully', result);
  }
}

export const aiController = new AiController();
