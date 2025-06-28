import jwt from "jsonwebtoken"
import * as yup from "yup"
import authConfig from "../../config/auth"
import User from "../models/User"

class SessionController {
	async store(request, response) {
		const schema = yup.object({
			email: yup.string().email().required(),
			password: yup.string().min(6).required()
		})

		const isValid = await schema.isValid(request.body)

		const emailOrPasswordIncorrect = () => {
			response
				.status(401)
				.json({ error: "Verifique seu e-mail e senha e tente novamente." })
		}

		if (!isValid) {
			return emailOrPasswordIncorrect()
		}

		const { email, password } = request.body

		const user = await User.findOne({
			where: {
				email: email.toLowerCase()
			}
		})

		if (!user) {
			return emailOrPasswordIncorrect()
		}

		const isSamePassword = await user.checkPassword(password)

		if (!isSamePassword) {
			return emailOrPasswordIncorrect()
		}

		return response.status(201).json({
			id: user.id,
			name: user.name,
			email: user.email,
			admin: user.admin,
			token: jwt.sign({ id: user.id, name: user.name }, authConfig.secret, {
				expiresIn: authConfig.expiresIn
			})
		})
	}
}

export default new SessionController()
