import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async store(req, res) {
    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman already exists' });
    }

    const { id, name, email, avatar_id } = await Deliveryman.create(req.body);

    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async update(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    if (req.body.email !== deliveryman.email) {
      const deliverymanExists = await Deliveryman.findOne({
        where: { email: req.body.email },
      });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    await deliveryman.update(req.body);

    const { id, name, email, avatar } = await Deliveryman.findByPk(
      req.params.id,
      {
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      }
    );

    return res.json({
      id,
      name,
      email,
      avatar,
    });
  }

  async index(req, res) {
    const deliverymen = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverymen);
  }

  async show(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    return res.json(deliveryman);
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists' });
    }

    await deliveryman.destroy();

    return res.send();
  }
}

export default new DeliverymanController();
