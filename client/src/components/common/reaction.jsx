import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import {
  faThumbsUp as farThumbsUp,
  faThumbsDown as farThumbsDown,
} from "@fortawesome/free-regular-svg-icons";
import {
  updatePostReaction,
  getPostReactions,
} from "../../services/reactionService";
import { useAuth } from "../../context/authContext";
import "./reaction.css";

const SocialReaction = ({ postId }) => {
  const [reactions, setReactions] = useState({
    likes: 0,
    dislikes: 0,
    userReaction: null,
  });
  const { user } = useAuth();

  useEffect(() => {
    const loadReactions = async () => {
      try {
        const { data } = await getPostReactions(postId);
        setReactions({
          likes: data.likes,
          dislikes: data.dislikes,
          userReaction: data.userReaction,
        });
      } catch (error) {
        console.error("Error loading reactions:", error);
      }
    };

    loadReactions();
  }, [postId]); // Reacts to postId changes

  const handleReaction = async (reactionType) => {
    if (!user) return; // Handle unauthenticated users

    const originalReactions = { ...reactions };

    // Optimistic update
    setReactions((prev) => {
      const newState = { ...prev };

      // Remove previous reaction if exists
      if (prev.userReaction) {
        newState[prev.userReaction + "s"]--;
      }

      // Toggle reaction
      if (prev.userReaction === reactionType) {
        newState.userReaction = null;
      } else {
        newState[reactionType + "s"]++;
        newState.userReaction = reactionType;
      }

      return newState;
    });

    try {
      await updatePostReaction(postId, reactionType);
    } catch (error) {
      setReactions(originalReactions);
      console.error("Error updating reaction:", error);
    }
  };

  return (
    <div className="social-reaction">
      <div className="reaction-button" onClick={() => handleReaction("like")}>
        <FontAwesomeIcon
          icon={reactions.userReaction === "like" ? faThumbsUp : farThumbsUp}
          className={reactions.userReaction === "like" ? "active" : ""}
        />
        <span className="reaction-count">{reactions.likes}</span>
      </div>

      <div
        className="reaction-button"
        onClick={() => handleReaction("dislike")}
      >
        <FontAwesomeIcon
          icon={
            reactions.userReaction === "dislike" ? faThumbsDown : farThumbsDown
          }
          className={reactions.userReaction === "dislike" ? "active" : ""}
        />
        <span className="reaction-count">{reactions.dislikes}</span>
      </div>
    </div>
  );
};

export default SocialReaction;
