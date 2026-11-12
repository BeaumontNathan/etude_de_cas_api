const NotFoundError = require("../../errors/not-found");
const ForbiddenError = require("../../errors/forbidden");
const articlesService = require("./articles.service");

class ArticlesController {
  async create(req, res, next) {
    try {
      const article = await articlesService.create({
        ...req.body,
        user: req.user._id,
      });
      req.io.emit("article:create", article);
      res.status(201).json(article);
    } catch (err) {
      next(err);
    }
  }
  async update(req, res, next) {
    try {
      if (req.user.role !== "admin") {
        throw new ForbiddenError();
      }
      const id = req.params.id;
      const data = req.body;
      const articleModified = await articlesService.update(id, data);
      if (!articleModified) {
        throw new NotFoundError();
      }
      req.io.emit("article:update", articleModified);
      res.json(articleModified);
    } catch (err) {
      next(err);
    }
  }
  async delete(req, res, next) {
    try {
      if (req.user.role !== "admin") {
        throw new ForbiddenError();
      }
      const id = req.params.id;
      await articlesService.delete(id);
      req.io.emit("article:delete", { id });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ArticlesController();
