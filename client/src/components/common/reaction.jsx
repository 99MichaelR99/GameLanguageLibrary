import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import {
  faThumbsUp as farThumbsUp,
  faThumbsDown as farThumbsDown,
} from "@fortawesome/free-regular-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  updatePostReaction,
  getPostReactions,
} from "../../services/reactionService";
import { checkIfPostExists } from "../../services/postService";
import { useAuth } from "../../context/authContext";

import "./reaction.css";

const SocialReaction = ({ postId }) => {
  const [reactions, setReactions] = useState({
    likes: 0,
    dislikes: 0,
    userReaction: null,
  });
  const { user } = useAuth();
  const [reactionChannel, setReactionChannel] = useState(null); // use state to manage the channel

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

    // Initialize the BroadcastChannel inside useEffect
    const channel = new BroadcastChannel("reactionChannel");
    setReactionChannel(channel); // store the channel in state

    // Set up message listener
    channel.onmessage = (event) => {
      if (event.data.postId === postId) {
        setReactions(event.data.reactions);
      }
    };

    // Cleanup: Close the channel when the component is unmounted
    return () => {
      channel.close();
    };
  }, [postId]); // Reacts to postId changes

  const handleReaction = async (reactionType) => {
    if (!user) return; // Handle unauthenticated users

    // Check if the post exists before proceeding
    const postExists = await checkIfPostExists(postId);
    if (!postExists) {
      toast.error("This post has been deleted.");
      return; // Prevent reacting to deleted post
    }

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
      const { data } = await updatePostReaction(postId, reactionType);
      setReactions({
        likes: data.likes ?? 0,
        dislikes: data.dislikes ?? 0,
        userReaction: data.userReaction ?? null,
      });

      // Ensure the reactionChannel is open before posting a message
      if (reactionChannel) {
        reactionChannel.postMessage({ postId, reactions: data });
      }
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
        <span className="reaction-count">
          {isNaN(reactions.likes) ? 0 : reactions.likes}
        </span>
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
        <span className="reaction-count">
          {isNaN(reactions.dislikes) ? 0 : reactions.dislikes}
        </span>
      </div>
    </div>
  );
};

export default SocialReaction;
