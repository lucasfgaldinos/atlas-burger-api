import * as yup from "yup"
import Category from "../models/Category"

class CategoryController {
	async store(request, response) {
		const schema = yup.object({
			name: yup.string().required()
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ error: err.errors })
		}

		const { filename: path } = request.file
		const { name } = request.body

		const categoryExists = await Category.findOne({
			where: {
				name
			}
		})

		if (categoryExists) {
			return response
				.status(409)
				.json({ error: "This category already exists." })
		}

		const category = await Category.create({
			name,
			path
		})

		return response.status(201).json(category)
	}

	async index(request, response) {
		const categories = await Category.findAll()

		return response.status(200).json(categories)
	}

	async update(request, response) {
		const schema = yup.object({
			name: yup.string()
		})

		try {
			schema.validateSync(request.body, { abortEarly: false })
		} catch (err) {
			return response.status(400).json({ error: err.errors })
		}

		const categoryId = request.params.id

		const categoryExists = await Category.findByPk(categoryId)

		if (!categoryExists) {
			return response.status(400).json({ error: "Category not found." })
		}

		let path
		if (request.file) {
			path = request.file.filename
		}

		let name

		if (request.body?.name) {
			name = request.body.name

			const categoryNameExists = await Category.findOne({
				where: {
					name
				}
			})

			if (categoryNameExists && +categoryId !== categoryNameExists.id) {
				return response
					.status(409)
					.json({ error: "This category already exists." })
			}
		}

		await Category.update(
			{
				name,
				path
			},
			{ where: { id: categoryId } }
		)

		return response.status(200).json()
	}
}

export default new CategoryController()
