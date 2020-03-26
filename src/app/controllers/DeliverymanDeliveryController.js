import { Op } from 'sequelize';
import { startOfDay, endOfDay, getHours, parseISO, isBefore } from 'date-fns';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanDeliveryController {
  async index(req, res) {
    const { id } = req.params;
    const { delivered } = req.query;

    const deliverymanExists = await Deliveryman.findByPk(id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    if (delivered === 'false') {
      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: id,
          end_date: null,
          canceled_at: null,
        },
        attributes: ['id', 'product', 'start_date', 'end_date'],
        include: [
          {
            model: File,
            as: 'signature',
            attributes: ['id', 'path', 'url'],
          },
          {
            model: Recipient,
            as: 'recipient',
            attributes: [
              'name',
              'city',
              'state',
              'street',
              'number',
              'complement',
              'zip_code',
            ],
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
      return res.json(deliveries);
    }

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        end_date: {
          [Op.not]: null,
        },
      },
      attributes: ['id', 'product', 'start_date', 'end_date'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'city',
            'state',
            'street',
            'number',
            'complement',
            'zip_code',
          ],
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
    return res.json(deliveries);
  }

  async update(req, res) {
    const { id, deliveryId } = req.params;

    const deliverymanExists = await Deliveryman.findByPk(id);

    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }

    const { start_date, end_date, signature_id } = req.body;

    const delivery = await Delivery.findByPk(deliveryId);

    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found' });
    }

    if (start_date) {
      const parsedHour = getHours(parseISO(start_date));

      if (parsedHour < 8 || parsedHour >= 18) {
        return res.status(400).json({
          error: 'The delivery only can be started between 8:00 and 18:00',
        });
      }

      const { count } = await Delivery.findAndCountAll({
        where: {
          deliveryman_id: id,
          start_date: {
            [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
          },
        },
      });

      if (count >= 5) {
        return res.status(400).json({
          error: 'You already made your 5 deliveries of the day',
        });
      }

      const parsedStartDate = parseISO(start_date);

      const updateDelivery = await delivery.update({
        start_date: parsedStartDate,
      });

      return res.json(updateDelivery);
    }

    if (end_date) {
      const parsedEndDate = parseISO(end_date);

      if (!delivery.start_date) {
        return res.status(400).json({
          error:
            'Error trying to make a delivery. The withdrawal does not exists',
        });
      }

      if (isBefore(parsedEndDate, delivery.start_date)) {
        return res
          .status(400)
          .json({ error: 'Delivery time has to be after the withdrawal time' });
      }

      const updateDelivery = await delivery.update({
        end_date: parsedEndDate,
        signature_id,
      });

      return res.json(updateDelivery);
    }
  }
}

export default new DeliverymanDeliveryController();
