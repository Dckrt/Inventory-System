app.post("/sell", async (req, res) => {
  const { product_id } = req.body;

  try {
    // 1. kunin recipe
    const [recipe] = await db.query(
      "SELECT * FROM product_ingredients WHERE product_id = ?",
      [product_id]
    );

    // 2. deduct each ingredient
    for (let item of recipe) {
      await db.query(
        "UPDATE ingredients SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.ingredient_id]
      );
    }

    res.json({ message: "Stock deducted!" });
  } catch (err) {
    res.status(500).json(err);
  }
});