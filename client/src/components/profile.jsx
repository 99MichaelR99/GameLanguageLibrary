import React from "react";
import ProfileForm from "./profileForm";
import UserPosts from "./userPosts";
import UserFavoriteGames from "./userFavoriteGames";

const Profile = () => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4">
          <ProfileForm />
        </div>
        <div className="col-md-8">
          <UserPosts />
          <UserFavoriteGames />
        </div>
      </div>
    </div>
  );
};

export default Profile;
