import ModelImage from "./model-image";
import { images } from "../configs/images";
export default function Art() {
  return (
    <div
      className="hero-illustration"
      aria-label="Your chef and today's fresh ingredients"
    >
      <span className="chef-speech">Ready, chef?</span>
      <ModelImage asset={images.chefIdle} className="hero-chef" />
      <ModelImage
        asset={images.vegetable}
        className="hero-ingredient ingredient-greens"
        decorative
      />
      <ModelImage
        asset={images.fruits}
        className="hero-ingredient ingredient-fruit"
        decorative
      />
      <ModelImage
        asset={images.tomato}
        className="hero-ingredient ingredient-tomato"
        decorative
      />
      <span className="illustration-spark spark-one">✦</span>
      <span className="illustration-spark spark-two">✦</span>
    </div>
  );
}
