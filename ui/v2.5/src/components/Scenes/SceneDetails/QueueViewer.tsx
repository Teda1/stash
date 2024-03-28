import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";
import { Button, Form, Spinner } from "react-bootstrap";
import { Icon } from "src/components/Shared/Icon";
import { useIntl } from "react-intl";
import {
  faChevronDown,
  faChevronUp,
  faRandom,
  faStepBackward,
  faStepForward,
  faUser,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { objectTitle } from "src/core/files";
import SceneQueue, { QueuedScene } from "src/models/sceneQueue";
import { INamedObject } from "src/utils/navigation";
import { queryFindScenes } from "src/core/StashService";
import { ListFilterModel } from "src/models/list-filter/filter";
import { CriterionModifier, FilterMode } from "src/core/generated-graphql";
import Slider from "@ant-design/react-slick";
import { PerformersCriterion } from "src/models/list-filter/criteria/performers";
import { StudiosCriterion } from "src/models/list-filter/criteria/studios";
import {
  Criterion,
  CriterionValue,
} from "src/models/list-filter/criteria/criterion";

enum DiscoverFilterType {
  Performer = "PERFORMER",
  Queue = "QUEUE",
  Studio = "STUDIO",
}

interface IDiscoverFilterOption {
  id: number;
  label: string;
  type: DiscoverFilterType;
  value?: INamedObject;
}

export interface IDiscoverOptions {
  currentScene?: QueuedScene;
  generateScene: (option: IDiscoverFilterOption) => void;
  showQueue: boolean;
  setShowQueue: (showQueue: boolean) => void;
}

const DiscoverSlider: React.FC<IDiscoverOptions> = ({
  currentScene,
  generateScene,
  showQueue,
  setShowQueue,
}) => {
  console.log(currentScene);
  const [discoverFilterOptions, setDiscoverFilterOptions] = useState<
    IDiscoverFilterOption[]
  >([]);
  const [currentOption, setCurrentOption] = useState(1);

  let sliderRef = useRef<Slider | null>(null);
  var settings = {
    dots: false,
    arrows: true,
    infinite: false,
    speed: 300,
    variableWidth: true,
    slidesToShow: 1,
  };

  function maybeRenderSVG(option: IDiscoverFilterOption) {
    if (option.type === DiscoverFilterType.Performer) {
      return <Icon icon={faUser} />;
    } else if (option.type === DiscoverFilterType.Studio) {
      return <Icon icon={faVideo} />;
    }
  }

  async function handleOptionClick(option: IDiscoverFilterOption) {
    setCurrentOption(option.id);
    if (option.id === 1) {
      setShowQueue(true);
    } else {
      generateScene(option);
    }
    console.log("currentOption: " + currentOption);
  }

  useEffect(() => {
    // reset index after queue is replaced
    if (sliderRef.current === null) {
      return;
    }

    if (showQueue) {
      setCurrentOption(1);
      sliderRef.current.slickGoTo(0);
    }
  }, [showQueue]);

  useEffect(() => {
    if (currentScene == undefined) {
      return;
    }

    let position = 1;
    let options = [
      {
        id: position++,
        label: "Queue",
        type: DiscoverFilterType.Queue,
        value: {},
      },
    ];
    console.log("added queue");

    // Studio based recommendations
    if (currentScene.studio) {
      options.push({
        id: position++,
        label: currentScene.studio.name!,
        type: DiscoverFilterType.Studio,
        value: currentScene.studio,
      });
    }

    // Performer based recommendations
    currentScene.performers?.map((performer: INamedObject) => {
      options.push({
        id: position++,
        label: performer.name!,
        type: DiscoverFilterType.Performer,
        value: performer,
      });
      console.log("added " + performer.name);
    });
    setDiscoverFilterOptions(options);
    console.log("set filter options");
  }, [currentScene]);

  return (
    <div className="discover-filter-container">
      <Slider ref={sliderRef} {...settings}>
        {discoverFilterOptions.map((option: IDiscoverFilterOption, i) => (
          <span
            className={`rec ${currentOption === option.id ? "active" : ""}`}
            key={i}
          >
            <a className="rec-value" onClick={() => handleOptionClick(option)}>
              {maybeRenderSVG(option)}
              {option.label}
            </a>
          </span>
        ))}
      </Slider>
    </div>
  );
};

export interface IPlaylistViewer {
  scenes: QueuedScene[];
  currentID?: string;
  start?: number;
  continue?: boolean;
  hasMoreScenes: boolean;
  setContinue: (v: boolean) => void;
  onSceneClicked: (id: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onRandom: () => void;
  onMoreScenes: () => void;
  onLessScenes: () => void;
  setDiscoverQueue: (discoverQueue: SceneQueue) => void;
}

export const QueueViewer: React.FC<IPlaylistViewer> = ({
  scenes,
  currentID,
  start = 0,
  continue: continuePlaylist = false,
  hasMoreScenes,
  setContinue,
  onNext,
  onPrevious,
  onRandom,
  onSceneClicked,
  onMoreScenes,
  onLessScenes,
  setDiscoverQueue,
}) => {
  const intl = useIntl();
  const [lessLoading, setLessLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);

  const currentIndex = scenes.findIndex((s) => s.id === currentID);

  const [showQueue, setShowQueue] = useState(true);
  const [discoverScenes, setDiscoverScenes] = useState<QueuedScene[]>();
  const [newQueue, setNewQueue] = useState<SceneQueue>();

  useEffect(() => {
    setLessLoading(false);
    setMoreLoading(false);
  }, [scenes]);

  function isCurrentScene(scene: QueuedScene) {
    return scene.id === currentID;
  }

  function handleDiscoverSceneClick(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ) {
    setDiscoverQueue(newQueue!);
    setShowQueue(true);
    onSceneClicked(id);
    event.preventDefault();
  }

  function handleSceneClick(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ) {
    onSceneClicked(id);
    event.preventDefault();
  }

  function lessClicked() {
    setLessLoading(true);
    onLessScenes();
  }

  function moreClicked() {
    setMoreLoading(true);
    onMoreScenes();
  }

  function buildPerformerQuery(option: IDiscoverFilterOption) {
    const scenefilter = new ListFilterModel(FilterMode.Scenes);
    scenefilter.sortBy = "date";
    let newCriterion: Criterion<CriterionValue>;
    if (option.type === DiscoverFilterType.Performer) {
      newCriterion = new PerformersCriterion();
    } else if (option.type === DiscoverFilterType.Studio) {
      newCriterion = new StudiosCriterion();
    } else {
      return SceneQueue.fromListFilterModel(scenefilter); // shouldn't happen
    }

    newCriterion.modifier = CriterionModifier.Includes;
    const item = option.value!;
    newCriterion.value = {
      items: [{ id: item.id!, label: item.name! }],
      excluded: [],
    };
    console.log(newCriterion);
    scenefilter.criteria = [newCriterion];
    return SceneQueue.fromListFilterModel(scenefilter);
  }

  async function generateScene(option: IDiscoverFilterOption) {
    console.log("Changing showQueue to false");
    console.log(option);
    setShowQueue(false);
    const sceneQueue = buildPerformerQuery(option);
    setNewQueue(sceneQueue);
    console.log(sceneQueue);
    console.log("sceneQueue.query: " + sceneQueue.query);
    const query = await queryFindScenes(sceneQueue.query!);
    const { scenes: newa } = query.data.findScenes;
    setDiscoverScenes(newa);
  }

  function maybeRenderSceneRec() {
    if (showQueue || discoverScenes === undefined) {
      return;
    }

    return (
      <div id="discover-content">
        <ol start={start}>
          {discoverScenes.map((scene: QueuedScene) => (
            <li
              className={cx("my-2", { current: isCurrentScene(scene) })}
              key={scene.id}
            >
              <Link
                to={`/scenes/${scene.id}`}
                onClick={(e) => handleDiscoverSceneClick(e, scene.id)}
              >
                <div className="ml-1 d-flex align-items-center">
                  <div className="thumbnail-container">
                    <img
                      loading="lazy"
                      alt={scene.title ?? ""}
                      src={scene.paths.screenshot ?? ""}
                    />
                  </div>
                  <div className="queue-scene-details">
                    <span className="queue-scene-title">
                      {objectTitle(scene)}
                    </span>
                    <span className="queue-scene-studio">
                      {scene?.studio?.name}
                    </span>
                    <span className="queue-scene-performers">
                      {scene?.performers
                        ?.map(function (performer) {
                          return performer.name;
                        })
                        .join(", ")}
                    </span>
                    <span className="queue-scene-date">{scene?.date}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {/* <ol start={start}>{discoverScenes.map(renderPlaylistEntry)}</ol> */}
        </ol>
      </div>
    );
  }

  function maybeRenderQueue() {
    console.log(showQueue);
    if (!showQueue) {
      return;
    }

    return (
      <>
        <div className="queue-controls">
          <div>
            <Form.Check
              id="continue-checkbox"
              checked={continuePlaylist}
              label={intl.formatMessage({ id: "actions.continue" })}
              onChange={() => {
                setContinue(!continuePlaylist);
              }}
            />
          </div>
          <div>
            {currentIndex > 0 || start > 1 ? (
              <Button
                className="minimal"
                variant="secondary"
                onClick={() => onPrevious()}
              >
                <Icon icon={faStepBackward} />
              </Button>
            ) : (
              ""
            )}
            {currentIndex < scenes.length - 1 || hasMoreScenes ? (
              <Button
                className="minimal"
                variant="secondary"
                onClick={() => onNext()}
              >
                <Icon icon={faStepForward} />
              </Button>
            ) : (
              ""
            )}
            <Button
              className="minimal"
              variant="secondary"
              onClick={() => onRandom()}
            >
              <Icon icon={faRandom} />
            </Button>
          </div>
        </div>
        <div id="queue-content">
          {start > 1 ? (
            <div className="d-flex justify-content-center">
              <Button onClick={() => lessClicked()} disabled={lessLoading}>
                {!lessLoading ? (
                  <Icon icon={faChevronUp} />
                ) : (
                  <Spinner animation="border" role="status" />
                )}
              </Button>
            </div>
          ) : undefined}
          <ol start={start}>{scenes.map(renderPlaylistEntry)}</ol>
          {hasMoreScenes ? (
            <div className="d-flex justify-content-center">
              <Button onClick={() => moreClicked()} disabled={moreLoading}>
                {!moreLoading ? (
                  <Icon icon={faChevronDown} />
                ) : (
                  <Spinner animation="border" role="status" />
                )}
              </Button>
            </div>
          ) : undefined}
        </div>
      </>
    );
  }

  function renderPlaylistEntry(scene: QueuedScene) {
    return (
      <li
        className={cx("my-2", { current: isCurrentScene(scene) })}
        key={scene.id}
      >
        <Link
          to={`/scenes/${scene.id}`}
          onClick={(e) => handleSceneClick(e, scene.id)}
        >
          <div className="ml-1 d-flex align-items-center">
            <div className="thumbnail-container">
              <img
                loading="lazy"
                alt={scene.title ?? ""}
                src={scene.paths.screenshot ?? ""}
              />
            </div>
            <div className="queue-scene-details">
              <span className="queue-scene-title">{objectTitle(scene)}</span>
              <span className="queue-scene-studio">{scene?.studio?.name}</span>
              <span className="queue-scene-performers">
                {scene?.performers
                  ?.map(function (performer) {
                    return performer.name;
                  })
                  .join(", ")}
              </span>
              <span className="queue-scene-date">{scene?.date}</span>
            </div>
          </div>
        </Link>
      </li>
    );
  }

  return (
    <div id="queue-viewer">
      <DiscoverSlider
        currentScene={currentIndex >= 0 ? scenes[currentIndex] : undefined}
        generateScene={generateScene}
        showQueue={showQueue}
        setShowQueue={setShowQueue}
      />
      {maybeRenderQueue()}
      {maybeRenderSceneRec()}
    </div>
  );
};

export default QueueViewer;
