router.get("/download/:txid", async (req, res) => {
  try {
    const { txid } = req.params;

    const pix = await consultarPixPorTxid(txid);

    if (pix.status !== "CONCLUIDA") {
      return res.status(403).json({ erro: "Pagamento ainda não confirmado" });
    }

    const filePath = path.join(
      __dirname,
      "..",
      "files",
      "ebook-brigadeiro-gourmet.pdf"
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ erro: "Arquivo não encontrado" });
    }

    console.log("📦 DOWNLOAD LIBERADO | TXID:", txid);
    res.download(filePath, "ebook-brigadeiro-gourmet.pdf");

  } catch (err) {
    console.error("❌ Erro no download:", err.message);
    res.status(500).json({ erro: "Erro ao liberar download" });
  }
});
