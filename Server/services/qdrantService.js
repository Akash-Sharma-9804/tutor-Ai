async function ensureQdrantCollection() {
  try {
    const collection = process.env.QDRANT_COLLECTION;
    const baseUrl = process.env.QDRANT_URL;
    const checkUrl = `${baseUrl}/collections/${collection}`;
    
    console.log("🔍 Checking if collection exists:", collection);

    const checkRes = await fetch(checkUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (checkRes.ok) {
      console.log("✅ Collection already exists:", collection);
      return true;
    }

    console.log("📦 Collection not found. Creating:", collection);
    const createUrl = `${baseUrl}/collections/${collection}`;
    
    const createRes = await fetch(createUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vectors: {
          size: 1536,
          distance: "Cosine"
        }
      })
    });

    const createResponseText = await createRes.text();
    
    if (!createRes.ok) {
      console.error("❌ Failed to create collection:");
      console.error("Status:", createRes.status);
      console.error("Response:", createResponseText);
      throw new Error(`Failed to create collection: ${createRes.status} - ${createResponseText}`);
    }

    console.log("✅ Collection created successfully:", collection);
    return true;

  } catch (err) {
    console.error("❌ Collection check/creation failed:", err.message);
    throw err;
  }
}

async function pushEmbeddingToQdrant(embedding, payload) {
  try {
    const collection = process.env.QDRANT_COLLECTION;
    const url = `${process.env.QDRANT_URL}/collections/${collection}/points`;

    const crypto = require('crypto');
    const pointId = crypto.randomUUID();

    console.log("📤 Pushing vector to:", url);
    console.log("🔢 Vector dimensions:", embedding.length);
    console.log("🆔 Qdrant Point ID (UUID):", pointId);
    console.log("🏷️ Chunk ID:", payload.chunk_id);

    // Build payload with all metadata
    const qdrantPayload = {
      chunk_id: payload.chunk_id,
      chapter_id: payload.chapter_id,
      book_id: payload.book_id,
      chapter_no: payload.chapter_no,
      chunk_no: payload.chunk_no,
      page_numbers: payload.page_numbers || [],
      paragraph_ids: payload.paragraph_ids || []
    };

    // Optionally store text preview (first 500 chars)
    if (payload.chunk_text) {
      qdrantPayload.text_preview = payload.chunk_text.substring(0, 500);
    }

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        points: [{
          id: pointId,
          vector: embedding,
          payload: qdrantPayload
        }]
      })
    });

    const responseText = await res.text();
    
    if (!res.ok) {
      console.error("❌ Qdrant rejected request:");
      console.error("Status:", res.status);
      console.error("Response:", responseText);
      throw new Error(`Failed to push vector to Qdrant: ${res.status} - ${responseText}`);
    }

    console.log("🧬 Uploaded point to Qdrant:", payload.chunk_id);
    return true;

  } catch (err) {
    console.error("❌ Vector push failed:", err.message);
    throw err;
  }
}

// module.exports = { pushEmbeddingToQdrant, ensureQdrantCollection };
module.exports = {}; // Qdrant disabled for now
