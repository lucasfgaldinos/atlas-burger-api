import * as yup from "yup"
import Category from "../models/Category"
import Product from "../models/Product"

class ProductsController {
	async store(request, response) {
		const schema = yup.object({
			name: yup.string().required(),
			price: yup.number().required(),
			category_id: yup.number().required(),
			offer: yup.boolean()
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ error: err.errors })
		}

		const { filename: path } = request.file
		const { name, price, category_id, offer } = request.body
		const newPrice = Number(price)
		const newCategory_id = Number(category_id)
		const newOffer = String(offer)

		const product = await Product.create({
			name,
			price: newPrice,
			category_id: newCategory_id,
			path,
			offer: newOffer
		})

		return response.status(201).json(product)
	}

	async index(request, response) {
		const products = await Product.findAll({
			include: [
				{
					model: Category,
					as: "category",
					attributes: ["id", "name"]
				}
			]
		})

		return response.status(200).json(products)
	}

	async update(request, response) {
		const schema = yup.object({
			name: yup.string(),
			price: yup.number(),
			category_id: yup.number(),
			offer: yup.boolean()
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ error: err.errors })
		}

		const userId = request.params.id

		const findProduct = await Product.findByPk(userId)

		if (!findProduct) {
			return response.status(400).json({ error: "Product not found." })
		}

		let path
		if (request.file) {
			path = request.file.filename
		}

		const { name, price, category_id, offer } = request.body

		await Product.update(
			{
				name,
				price,
				category_id,
				path,
				offer
			},
			{ where: { id: userId } }
		)

		return response.status(200).json()
	}
}

export default new ProductsController()
