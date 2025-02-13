import { Link } from "react-router-dom";
import styled from "styled-components";

const EpicLink = styled(Link)`
  color: #007bff; /* Royal Blue */
  font-weight: bold;
  cursor: pointer;
  text-decoration: none; /* Removes the underline */
  transition: color 0.3s ease-in-out, text-shadow 0.3s ease-in-out;

  &:hover {
    color: #00e6ff; /* Cyan */
    text-shadow: 0px 0px 10px #00e6ff, 0px 0px 20px #0056b3; /* Deep blue shadow */
  }

  &:active {
    color: #0056b3; /* Darker blue when active */
  }
`;

export default EpicLink;
