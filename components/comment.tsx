
'use client'

import { useEffect, useState } from "react";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const Comments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/comment");

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data: Comment[] = await response.json();
        setComments(data);

      } catch (error) {
        console.error(error);
        setError("Failed to load comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  if (loading) {
    return <p className="p-8">Loading...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  return (
    <section className="bg-[rgba(248,248,248,1)] py-10 sm:py-14 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">

        <h1 className="font-bold text-3xl sm:text-4xl lg:text-6xl text-[rgba(187,35,57,1)] mb-8 sm:mb-10">
          Customer Reviews
        </h1>

        <div className="
          max-h-[900px]
          overflow-y-auto
          overflow-x-hidden
          pr-2
          scrollbar-thin
          scrollbar-thumb-gray-400
          scrollbar-track-gray-200
        ">
          <div className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
            sm:gap-5
            lg:gap-6
            auto-rows-[190px]
          ">

            {comments.slice(0, 6).map((comment) => (
              <div
                key={comment.id}
                className="
                  h-[190px]
                  bg-white
                  rounded-2xl
                  shadow-sm
                  hover:shadow-lg
                  border border-gray-100
                  p-4 sm:p-5
                  flex
                  items-start
                  gap-4
                  transition-all
                  duration-300
                "
              >

                {/* Date */}
                <div className="
                  w-12
                  shrink-0
                  flex
                  flex-col
                  text-center
                  leading-none
                ">
                  <span className="
                    text-gray-500
                    text-sm
                    pb-2
                    mb-2
                    border-b-2
                    border-gray-200
                  ">
                    {new Date(comment.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "short" }
                    )}
                  </span>

                  <span className="
                    font-bold
                    text-xl
                    text-gray-800
                  ">
                    {new Date(comment.createdAt).getDate()}
                  </span>
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">

                  <h2 className="
                    font-bold
                    text-base
                    sm:text-lg
                    text-gray-900
                    mb-2
                    line-clamp-1
                  ">
                    {comment.user?.name}
                  </h2>

                  <p className="
                    text-gray-600
                    text-sm
                    leading-relaxed
                    line-clamp-3
                  ">
                    {comment.content}
                  </p>

                  <p className="
                    text-[rgba(187,35,57,1)]
                    font-semibold
                    text-sm
                    mt-3
                    truncate
                  ">
                    — {comment.user?.email}
                  </p>

                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
};

export default Comments;
