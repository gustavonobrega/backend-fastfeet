import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const { description } = req.body;

    const deliveryproblem = await DeliveryProblem.create({
      delivery_id: id,
      description,
    });

    return res.json(deliveryproblem);
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const pageLimit = 5;

    const {
      rows: deliveryProblems,
      count,
    } = await DeliveryProblem.findAndCountAll({
      attributes: ['id', 'description', 'delivery_id'],
      order: ['delivery_id'],
      limit: pageLimit,
      offset: (page - 1) * pageLimit,
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: [
            'id',
            'product',
            'deliveryman_id',
            'recipient_id',
            'canceled_at',
          ],
          where: {
            canceled_at: null,
          },
        },
      ],
    });

    return res.json({
      deliveryProblems,
      lastPage: Math.ceil(count / pageLimit),
    });
  }

  async show(req, res) {
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    const deliveryProblem = await DeliveryProblem.findAll({
      where: { delivery_id: id },
      attributes: ['id', 'description', 'delivery_id', 'created_at'],
    });

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryProblem = await DeliveryProblem.findByPk(id);

    if (!deliveryProblem) {
      return res
        .status(400)
        .json({ error: 'Delivery Problem does not exists' });
    }

    const { delivery_id } = deliveryProblem;

    const delivery = await Delivery.findByPk(delivery_id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists' });
    }

    delivery.canceled_at = new Date();

    await delivery.save();

    await Queue.add(CancellationMail.key, {
      delivery,
      deliveryProblem,
    });

    return res.json(delivery);
  }
}

export default new DeliveryProblemController();
