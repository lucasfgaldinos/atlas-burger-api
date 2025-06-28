import { Router } from "express"
import multer from "multer"
import CategoryController from "./app/controllers/CategoryController"
import OrderController from "./app/controllers/OrderController"
import ProductsController from "./app/controllers/ProductsController"
import SessionController from "./app/controllers/SessionController"
import UserController from "./app/controllers/UserController"
import CreatePaymentIntentController from "./app/controllers/stripe/CreatePaymentIntentController"
import authMiddleware from "./app/middlewares/auth"
import authAdminMiddleware from "./app/middlewares/authAdmin"
import multerConfig from "./config/multer"

const routes = new Router()

const upload = multer(multerConfig)

routes.post("/users", UserController.store)
routes.post("/session", SessionController.store)

routes.use(authMiddleware)

routes.get("/products", ProductsController.index)

routes.get("/categories", CategoryController.index)

routes.post("/orders", OrderController.store)

routes.post("/create-payment-intent", CreatePaymentIntentController.store)

routes.use(authAdminMiddleware)

routes.post("/products", upload.single("file"), ProductsController.store)

routes.put("/products/:id", upload.single("file"), ProductsController.update)

routes.post("/categories", upload.single("file"), CategoryController.store)

routes.put("/categories/:id", upload.single("file"), CategoryController.update)

routes.get("/orders", OrderController.index)

routes.put("/orders/:id", OrderController.update)

export default routes
