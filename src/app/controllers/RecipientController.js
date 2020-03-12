import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const recipient = await Recipient.create(req.body);

    return res.json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient not found' });
    }

    await recipient.update(req.body);

    return res.json(req.body);
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const pageLimit = 5;

    const { rows: recipients, count } = await Recipient.findAndCountAll({
      limit: pageLimit,
      offset: (page - 1) * pageLimit,
    });

    return res.json({ recipients, lastPage: Math.ceil(count / pageLimit) });
  }

  async show(req, res) {
    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient does not exists' });
    }

    return res.json(recipient);
  }

  async delete(req, res) {
    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(401).json({ error: 'Recipient does not exists' });
    }

    await recipient.destroy();

    return res.send();
  }
}

export default new RecipientController();
