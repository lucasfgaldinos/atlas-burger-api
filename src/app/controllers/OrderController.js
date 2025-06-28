import * as yup from "yup"
import Category from "../models/Category"
import Product from "../models/Product"
import Order from "../schemas/Order"

class OrderController {
	async store(request, response) {
		const schema = yup.object({
			products: yup
				.array()
				.required()
				.of(
					yup.object({
						id: yup.number().required(),
						quantity: yup.number().required()
					})
				)
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ error: err.errors })
		}

		const { products } = request.body

		const productsId = products.map((product) => product.id)

		const findProducts = await Product.findAll({
			where: {
				id: productsId
			},
			include: [
				{
					model: Category,
					as: "category",
					attributes: ["name"]
				}
			]
		})

		const formattedProducts = findProducts.map((product) => {
			const productIndex = products.findIndex((item) => item.id === product.id)

			return {
				id: product.id,
				name: product.name,
				category: product.category.name,
				price: product.price,
				url: product.url,
				quantity: products[productIndex].quantity
			}
		})

		const order = {
			user: {
				id: request.userId,
				name: request.userName
			},
			products: formattedProducts,
			status: "Pedido realizado."
		}

		const createdOrder = await Order.create(order)

		return response.status(201).json(createdOrder)
	}

	async index(request, response) {
		const orders = await Order.find()

		return response.status(200).json(orders)
	}

	async update(request, response) {
		const schema = yup.object({
			status: yup.string().required()
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ error: err.errors })
		}

		const orderId = request.params.id
		const { status } = request.body

		try {
			await Order.updateOne({ _id: orderId }, { status })
		} catch (err) {
			return response.status(400).json({ error: "Order not found." })
		}

		return response
			.status(200)
			.json({ message: "Status updated successfully." })
	}
}

export default new OrderController()
