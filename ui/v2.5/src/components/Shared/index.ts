export * from "./Select";
export { default as Icon } from "./Icon";
export { default as Modal } from "./Modal";
export { CollapseButton } from "./CollapseButton";
export { DetailsEditNavbar } from "./DetailsEditNavbar";
export { DurationInput } from "./DurationInput";
export { TagLink } from "./TagLink";
export { HoverPopover } from "./HoverPopover";
export { default as LoadingIndicator } from "./LoadingIndicator";
export { ImageInput } from "./ImageInput";
export { SweatDrops } from "./SweatDrops";
export { default as CountryFlag } from "./CountryFlag";
export { default as SuccessIcon } from "./SuccessIcon";
export { default as ErrorMessage } from "./ErrorMessage";
export { default as TruncatedText } from "./TruncatedText";
export { GridCard } from "./GridCard";
export { RatingStars } from "./RatingStars";
export { ExportDialog } from "./ExportDialog";
export { default as DeleteEntityDialog } from "./DeleteEntityDialog";
export { IndeterminateCheckbox } from "./IndeterminateCheckbox";
export { OperationButton } from "./OperationButton";
export { URLField } from "./URLField";
export const TITLE_SUFFIX = " | Stash";

function determineSlidesToScroll(
  cardCount: number,
  prefered: number,
  isTouch: boolean
) {
  if (isTouch) {
    return 1;
  } else if (cardCount! > prefered) {
    return prefered;
  } else {
    return cardCount;
  }
}

export function getSlickSettings(cardCount: number, isTouch: boolean) {
  return {
    dots: !isTouch,
    arrows: !isTouch,
    infinite: !isTouch,
    speed: 300,
    variableWidth: true,
    swipeToSlide: true,
    slidesToShow: cardCount! > 5 ? 5 : cardCount,
    slidesToScroll: determineSlidesToScroll(cardCount!, 5, isTouch),
    responsive: [
      {
        breakpoint: 1909,
        settings: {
          slidesToShow: cardCount! > 4 ? 4 : cardCount,
          slidesToScroll: determineSlidesToScroll(cardCount!, 4, isTouch),
        },
      },
      {
        breakpoint: 1542,
        settings: {
          slidesToShow: cardCount! > 3 ? 3 : cardCount,
          slidesToScroll: determineSlidesToScroll(cardCount!, 3, isTouch),
        },
      },
      {
        breakpoint: 1170,
        settings: {
          slidesToShow: cardCount! > 2 ? 2 : cardCount,
          slidesToScroll: determineSlidesToScroll(cardCount!, 2, isTouch),
        },
      },
      {
        breakpoint: 801,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
        },
      },
    ],
  };
}
