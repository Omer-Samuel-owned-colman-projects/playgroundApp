class DefaultController {
    constructor(dataModel) {
        this.model = dataModel;
    }

    async get(req, res) {
        const filter = req.query || {};
        try {
            const data = await this.model.find(filter);
            return res.json(data);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    };


    async getById(req, res) {
        const { id } = req.params;
        try {
            const data = await this.model.findById(id);
            if (!data) {
                return res.status(404).json({ error: "Data not found" });
            } else {
                res.json(data);
            }
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    };

    async post(req, res) {
        const { body } = req;
        try {
            const response = await this.model.create(body);
            res.status(201).json(response);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    };

    async del(req, res) {
        const { id } = req.params;
        try {
            const response = await this.model.findByIdAndDelete(id);
            res.send(response);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    };

    async put(req, res) {
        const { params: { id }, body } = req;
        try {
            const response = await this.model.findByIdAndUpdate(id, body, { new: true });
            res.json(response);
        } catch (error) {
            res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    };
};
module.exports = DefaultController;