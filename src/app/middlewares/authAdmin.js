import User from "../models/User"

async function authAdminMiddleware(request, response, next) {
	const { userId } = request

	const {
		dataValues: { admin: isAdmin }
	} = await User.findByPk(userId)

	if (!isAdmin) {
		return response.status(401).json()
	}

	return next()
}

export default authAdminMiddleware
