import Mail from '../../lib/Mail';

class CreationDeliveryMail {
  get key() {
    return 'CreationMail';
  }

  async handle({ data }) {
    const { deliveryman, recipient, product } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova entrega',
      template: 'creationDelivery',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.name,
        product,
        city: recipient.city,
        state: recipient.state,
        street: recipient.street,
        number: recipient.number,
        zip_code: recipient.zip_code,
      },
    });
  }
}

export default new CreationDeliveryMail();
