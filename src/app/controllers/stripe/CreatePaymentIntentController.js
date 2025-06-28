import Stripe from "stripe"
import * as yup from "yup"
import { stripeData } from "../../../config/stripe"

const stripe = new Stripe(stripeData.sk)

const calculateOrderAmount = (products) => {
	if (products.length > 0) {
		const total = products.reduce((acc, currentValue) => {
			return acc + currentValue.price * currentValue.quantity
		}, 0)

		return total
	}
}

class CreatePaymentIntentController {
	async store(request, response) {
		const schema = yup.object({
			deliveryFee: yup.number().required(),
			products: yup
				.array()
				.of(
					yup.object({
						id: yup.number().required(),
						price: yup.number().min(50).required(),
						quantity: yup.number().required()
					})
				)
				.min(1, "At least one product is required.")
				.required()
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ error: err.errors })
		}

		const { deliveryFee, products } = request.body

		const paymentIntent = await stripe.paymentIntents.create({
			amount: calculateOrderAmount(products) + deliveryFee,
			currency: "brl",
			automatic_payment_methods: {
				enabled: true
			}
		})

		response.send({
			clientSecret: paymentIntent.client_secret,
			total: paymentIntent.amount
		})
	}
}

export default new CreatePaymentIntentController()
