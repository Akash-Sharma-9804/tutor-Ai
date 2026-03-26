import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

 

const ChapterWorksheets = () => {
 
  const { chapterId, bookId } = useParams();
  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/worksheets`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWorksheets(res.data.worksheets);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

        .ws-root {
  min-height: 100vh;
   
          font-family: 'DM Sans', sans-serif;
          padding: 48px 24px;
        }

        .ws-container {
          max-width: 680px;
          margin: 0 auto;
        }
          .ws-back-btn {
  margin-bottom: 20px;
  background: none;
  border: none;
  font-size: 13px;
   
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
}

 

        .ws-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #c8763a;
          margin-bottom: 10px;
        }

        .ws-heading {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
        
          margin: 0 0 6px 0;
          line-height: 1.15;
        }

        .ws-subheading {
  font-size: 14px;
   
          margin-bottom: 40px;
        }

        .ws-divider {
          width: 48px;
          height: 3px;
          background: #c8763a;
          border-radius: 2px;
          margin-bottom: 36px;
        }

        .ws-skeleton {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ws-skeleton-card {
          height: 88px;
          background: linear-gradient(90deg, #ede9e2 25%, #e4dfd6 50%, #ede9e2 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .ws-grid {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ws-card {
   
          border-radius: 18px;
          padding: 22px 26px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          transition: all 0.22s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          position: relative;
          overflow: hidden;
        }

        .ws-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: #c8763a;
          opacity: 0;
          transition: opacity 0.2s ease;
          border-radius: 18px 0 0 18px;
        }

        .ws-card:hover {
          border-color: #c8763a;
          box-shadow: 0 6px 24px rgba(200, 118, 58, 0.12);
          transform: translateY(-2px);
        }

        .ws-card:hover::before {
          opacity: 1;
        }

        .ws-card-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .ws-card-icon {
          width: 44px;
          height: 44px;
          background: #fff8f3;
          border: 1.5px solid #f0ddd0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
        }

        .ws-card-title {
  font-size: 15px;
  font-weight: 600;
   
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .ws-card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
   
        }

        .ws-badge {
          background: #fff3eb;
          color: #c8763a;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 100px;
          border: 1px solid #f0ddd0;
        }

        .ws-arrow {
          color: #c8763a;
          opacity: 0;
          transition: opacity 0.2s, transform 0.2s;
          font-size: 18px;
        }

        .ws-card:hover .ws-arrow {
          opacity: 1;
          transform: translateX(4px);
        }

        .ws-empty {
  text-align: center;
  padding: 64px 24px;
   
        }

        .ws-empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .ws-empty-text {
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
        }

        .ws-card-anim {
          animation: cardIn 0.4s ease both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="ws-root bg-[#faf8f5] dark:bg-[#141210]">
        <div className="ws-container">

  <button className="ws-back-btn text-[#8a7f72] dark:text-[#9a8f83] hover:text-[#1a1510] dark:hover:text-[#f0ebe4] hover:bg-[#f0ebe4] dark:hover:bg-[#2a2620]" onClick={() => navigate(`/book/${bookId}`)}>
    ← Back
  </button>
          <p className="ws-eyebrow">Chapter Resources</p>
          <h1 className="ws-heading text-[#8a7f72] dark:text-[#9a8f83]">Worksheets</h1>
          <p className="ws-subheading text-[#8a7f72] dark:text-[#9a8f83]">Practice and reinforce your understanding</p>
          <div className="ws-divider" />

          {loading ? (
            <div className="ws-skeleton">
              {[1, 2, 3].map((n) => (
                <div key={n} className="ws-skeleton-card" />
              ))}
            </div>
          ) : worksheets.length === 0 ? (
            <div className="ws-empty text-[#a09589] dark:text-[#9a8f83]">
              <div className="ws-empty-icon">📄</div>
              <p className="ws-empty-text">No worksheets available for this chapter yet.</p>
            </div>
          ) : (
            <div className="ws-grid">
              {worksheets.map((ws, i) => (
                <div
                  key={ws.id}
                  className="ws-card ws-card-anim bg-white dark:bg-[#1e1c19] border border-[#ede9e2] dark:border-[#2a2620]"
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => navigate(`/worksheet/${ws.id}`)}
                >
                  <div className="ws-card-left">
                    <div className="ws-card-icon">📝</div>
                    <div>
                      <div className="ws-card-title text-[#1a1510] dark:text-[#f0ebe4]">{ws.title}</div>
                      <div className="ws-card-meta text-[#a09589] dark:text-[#9a8f83]">
                        <span className="ws-badge">{ws.total_questions} questions</span>
                      </div>
                    </div>
                  </div>
                  <div className="ws-arrow">→</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChapterWorksheets;