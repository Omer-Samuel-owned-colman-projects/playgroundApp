import { Request, Response } from 'express';
import { Model } from 'mongoose';

class DefaultController {
    protected model: Model<any>;

    constructor(dataModel: Model<any>) {
        this.model = dataModel;
    }

    async get(req: Request, res: Response): Promise<Response> {
        const filter = req.query || {};
        try {
            const data = await this.model.find(filter);
            return res.json(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return res.status(500).json({ error: errorMessage });
        }
    }

    async getById(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const data = await this.model.findById(id);
            if (!data) {
                return res.status(404).json({ error: "Data not found" });
            } else {
                return res.json(data);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return res.status(500).json({ error: errorMessage });
        }
    }

    async post(req: Request, res: Response): Promise<Response> {
        const { body } = req;
        try {
            const response = await this.model.create(body);
            return res.status(201).json(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return res.status(500).json({ error: errorMessage });
        }
    }

    async del(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try {
            const response = await this.model.findByIdAndDelete(id);
            return res.send(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return res.status(500).json({ error: errorMessage });
        }
    }

    async put(req: Request, res: Response): Promise<Response> {
        const { params: { id }, body } = req;
        try {
            const response = await this.model.findByIdAndUpdate(id, body, { new: true });
            return res.json(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return res.status(500).json({ error: errorMessage });
        }
    }
}

export default DefaultController;
