import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import CreationDeliveryMail from '../jobs/CreationDeliveryMail';
import Queue from '../../lib/Queue';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().integer(),
      deliveryman_id: Yup.number().integer(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    const { recipient_id, deliveryman_id, product } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);

    if (!recipientExists) {
      return res.status(401).json({ error: 'Recipient does not exists' });
    }

    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExists) {
      return res.status(401).json({ error: 'Deliveryman does not exists' });
    }

    const { id } = await Delivery.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    await Queue.add(CreationDeliveryMail.key, {
      deliveryman: deliverymanExists,
      recipient: recipientExists,
      product,
    });

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  async index(req, res) {
    const delivery = await Delivery.findAll({
      attributes: [
        'id',
        'product',
        'recipient_id',
        'deliveryman_id',
        'start_date',
        'end_date',
        'canceled_at',
        'signature_id',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'city', 'state'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(delivery);
  }

  async show(req, res) {
    const delivery = await Delivery.findByPk(req.params.id, {
      attributes: [
        'id',
        'product',
        'recipient_id',
        'deliveryman_id',
        'start_date',
        'end_date',
        'canceled_at',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number', 'city', 'state', 'zip_code'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exists' });
    }

    return res.json(delivery);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().integer(),
      deliveryman_id: Yup.number().integer(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exists' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const recipientExists = await Recipient.findByPk(recipient_id);
    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    if (!recipientExists) {
      return res.status(401).json({ error: 'Recipient does not exists' });
    }

    if (!deliverymanExists) {
      return res.status(401).json({ error: 'Deliveryman does not exists' });
    }

    if (delivery.start_date) {
      return res
        .status(401)
        .json({ error: 'The delivery already has been sent' });
    }

    await delivery.update({
      product,
      recipient_id,
      deliveryman_id,
    });

    return res.json({
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) {
      return res.status(401).json({ error: 'Delivery does not exists' });
    }

    if (delivery.start_date) {
      return res
        .status(401)
        .json({ error: 'The delivery already has been sent' });
    }

    await delivery.destroy();

    return res.send();
  }
}

export default new DeliveryController();
