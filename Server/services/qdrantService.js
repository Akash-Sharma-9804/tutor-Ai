async function pushEmbeddingToQdrant(embedding, payload) {
  try {
    const res = await fetch(`${process.env.QDRANT_URL}/collections/file_chunks/points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: [{
          id: payload.chunk_id,
          vector: embedding,
          payload
        }]
      })
    });

    if (!res.ok) {
      throw new Error("❌ Failed to push vector to Qdrant");
    }

    return true;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = { pushEmbeddingToQdrant };
