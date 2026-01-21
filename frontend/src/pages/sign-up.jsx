import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";

import { userService } from "../services/user.service.js";
import { useDispatch } from "react-redux";
import { signupUser } from "../store/auth.actions";
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service.js";

import logo from "../assets/img/logo.png";

import { Icon } from "monday-ui-react-core";
import { MoveArrowRight } from "monday-ui-react-core/icons";

export function SignUp() {
  const boards = useSelector((storeState) => storeState.boardModule.boards);
  const [credentials, setCredentials] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    fullname: "",
    imgUrl: "",
    companyName: "",
    role: "Employee",
    address: "",
  });
  const navigate = useNavigate();
  const [isNewCompany, setIsNewCompany] = useState(false);

  function clearState() {
    setCredentials({
      email: "",
      username: "",
      password: "",
      fullname: "",
      imgUrl: "",
    });
  }

  function handleChange(ev) {
    const field = ev.target.name;
    const value = ev.target.value;
    setCredentials({ ...credentials, [field]: value });
  }

  async function checkCompanyExists(companyName) {
    if (!companyName) {
      setIsNewCompany(false);
      return;
    }
    try {
      const users = await userService.getUsers();
      const exists = users.some(
        (u) =>
          u.companyName &&
          u.companyName.toLowerCase() === companyName.toLowerCase(),
      );
      setIsNewCompany(!exists);
      // if company is new, force Founder role
      if (!exists) setCredentials((prev) => ({ ...prev, role: "Founder" }));
    } catch (err) {
      console.error("Failed checking company existence", err);
    }
  }

  async function onImageChange(ev) {
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCredentials({ ...credentials, imgUrl: reader.result });
    };
    reader.readAsDataURL(file);
  }

  const dispatch = useDispatch();
  async function onSignup(ev = null) {
    if (ev) ev.preventDefault();
    // basic validation
    if (!credentials.email || !credentials.password || !credentials.fullname) {
      showErrorMsg("Please fill required fields");
      return;
    }
    if (credentials.password !== credentials.confirmPassword) {
      showErrorMsg("Passwords do not match");
      return;
    }
    try {
      await dispatch(signupUser(credentials));
      clearState();
      // navigate to first board if available
      if (boards && boards.length) navigate(`/board/${boards[0]._id}`);
      else navigate("/");
    } catch (err) {
      console.log("error: ", err);
      showErrorMsg("Signup failed");
    }
  }

  return (
    <section className="signup">
      <Link to="/" className="top-header">
        <div className="login-signup-logo">
          {" "}
          <img className="login-logo" src={logo} alt="logo" /> Anyday
          <span>.com</span>{" "}
        </div>
      </Link>
      <div className="router-wrapper">
        <div className="email-password-container">
          <h1 className="signup-header">
            <b>Sign</b>
            {" Up"}
          </h1>
          <div className="email-page-two">
            <form
              className="email-password-input-and-button-container"
              onSubmit={onSignup}
            >
              <div className="form-input-container">
                <span className="email-password-label">Email</span>
                <div className="email-input-container">
                  <input
                    onChange={handleChange}
                    id="email"
                    placeholder="Example@company.com"
                    type="email"
                    name="email"
                    className="email-input"
                    aria-label="Enter your work email address"
                    required
                  />
                </div>
              </div>
              <div className="form-input-container">
                <span className="email-password-label">Name</span>
                <div className="password-input-container">
                  <input
                    onChange={handleChange}
                    id="fullname"
                    type="text"
                    name="fullname"
                    className="name-input"
                    placeholder="Full name"
                    required
                  />
                </div>
              </div>
              <div className="form-input-container">
                <span className="email-password-label">Password</span>
                <div className="password-input-container">
                  <input
                    onChange={handleChange}
                    id="password"
                    type="password"
                    name="password"
                    className="password-input"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              <div className="form-input-container">
                <span className="email-password-label">Company</span>
                <div className="company-input-container">
                  <input
                    onChange={handleChange}
                    onBlur={(e) => checkCompanyExists(e.target.value)}
                    id="companyName"
                    type="text"
                    name="companyName"
                    className="company-input"
                    placeholder="Company name (optional)"
                  />
                </div>
              </div>

              <div className="form-input-container">
                <span className="email-password-label">Role</span>
                <div className="role-select-container">
                  <select
                    name="role"
                    value={credentials.role}
                    onChange={handleChange}
                  >
                    {isNewCompany ? (
                      <>
                        <option value="Founder">Founder</option>
                      </>
                    ) : (
                      <>
                        <option value="Founder">Founder</option>
                        <option value="Co-Founder">Co-Founder</option>
                        <option value="Employee">Employee</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-input-container">
                <span className="email-password-label">Profile image</span>
                <div className="image-input-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                  />
                  {credentials.imgUrl && (
                    <img
                      src={credentials.imgUrl}
                      alt="preview"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        marginTop: 8,
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="next-btn-wrapper">
                <div className="next-btn-container">
                  <button type="submit" className="next-btn">
                    <div className="next-wrapper">Sign up</div>
                    <div className="right-arrow-icon">
                      <Icon
                        iconType={Icon.type.SVG}
                        icon={MoveArrowRight}
                        iconSize={18}
                      />
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="login-seperator-container">
            <div className="login-seperator">
              <span className="seperator-line"></span>
              <h2 className="or-sign-in-txt">Or</h2>
              <span className="seperator-line"></span>
            </div>
          </div>

          <Link to="/login" className="login-to-other-acc">
            <span>Already have an account? </span>
            <button className="other-acc-btn">Log in</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
