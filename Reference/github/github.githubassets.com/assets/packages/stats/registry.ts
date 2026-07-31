interface CustomMetric {
  name: string
  hash: string
  type: PlatformBrowserCustomMetricType
}

// To add to this list, read the README (including the required Datadog tag ingestion configuration step):
// https://github.com/github/github-ui/blob/main/packages/stats/README.md

export const CUSTOM_METRIC_REGISTRY = {
  PRS_COMMENT_BOX_INP: {
    name: 'pull_requests.comment_box.inp',
    hash: '070a85f091c124d118031ed374badf58df0cd9c2902f9aa4f9e09f6fdcbb91d0',
    type: 'distribution',
  },
  PULL_REQUESTS_FILES_JS_HEAP: {
    name: 'pull_requests.files.js_heap',
    hash: '7c5d986de8ccbfd17ae58e0da85158912cf65aeb256aecf28c35ddeb794cd2d3',
    type: 'distribution',
  },
  PRS_ADD_COMMENT_BUTTON_CLICK: {
    name: 'pull_requests.add_comment_button.inp',
    hash: '872209fcee2ac679a3222260dbc7eb24c73ec3d6b41e635aaf761e61a5c26ccf',
    type: 'distribution',
  },
  PULL_REQUESTS_FILE_TREE_DIFF_FILE_CLICK: {
    name: 'pull_requests.file_tree_diff_file_click.inp',
    hash: '876809d762329dac08e4e44288005e102b33e6adebbc46e6f0a115bba2b8aa5e',
    type: 'distribution',
  },
  PULL_REQUESTS_FILE_TREE_DIFF_FILE_KEYBOARD_SELECTION: {
    name: 'pull_requests.file_tree_diff_file_keyboard_selection.inp',
    hash: '24f3088df0d2fcde21ee1c271b6c3d10a9e819afc581e7740bc6c79a3bec925a',
    type: 'distribution',
  },
  PULL_REQUESTS_DIFF_LINE_NUMBER_CLICK: {
    name: 'pull_requests.diff_line_number_click.inp',
    hash: 'df84c70a71715d434bc8784f6f9f6d53c94ed0ab9e4992aa8d4fed0f94b64ec3',
    type: 'distribution',
  },
  BROWSER_MEMORY_DIST_HEAP_USED: {
    name: 'browser.memory.dist.heap_used',
    hash: 'fdb6e6ee4c8789822429ad902990d5750938634f17838370c79e1abd14875d86',
    type: 'distribution',
  },
  BROWSER_MEMORY_DIST_HEAP_UTILIZATION: {
    name: 'browser.memory.dist.heap_utilization',
    hash: '962a4cd9cec8fd04bfe4c49e90f70725e6c3c8cbe2c23f7c96be44d9e99fe090',
    type: 'distribution',
  },
  BROWSER_MEMORY_DIST_SESSION_GROWTH: {
    name: 'browser.memory.dist.session_growth',
    hash: 'bcc4dcdd2464d0a48e1478928740dfb341ca58d509cdd87d6405e97db3518988',
    type: 'distribution',
  },
  BROWSER_MEMORY_DIST_SESSION_MAX: {
    name: 'browser.memory.dist.session_max',
    hash: 'c61522ce6a8197750684b38d43bd495f8c8208ff945f274743711f47f577079a',
    type: 'distribution',
  },
  BROWSER_REACT_PROFILER_APP_ACTUAL_DURATION: {
    name: 'browser.react.profiler.app.actual_duration',
    hash: '0c82ee3933bf3b484f6aaa3e9ff4b53c7281e23747d3aa23d1c2967073dc989a',
    type: 'distribution',
  },
  BROWSER_REACT_PROFILER_APP_BASE_DURATION: {
    name: 'browser.react.profiler.app.base_duration',
    hash: '71c768070b707947eebff7086f64b92d0a07dc4149e7d4e05a0641c4dad6bb63',
    type: 'distribution',
  },
  BROWSER_REACT_PROFILER_APP_COMMIT_LAG: {
    name: 'browser.react.profiler.app.commit_lag',
    hash: '1640ce88b596f4bd472a0920aab28fc3a19fa159ce73e24d85749412068c8057',
    type: 'distribution',
  },
  BROWSER_REACT_PROFILER_ROUTE_ACTUAL_DURATION: {
    name: 'browser.react.profiler.route.actual_duration',
    hash: '20a2fd38da8dc5afa74167e694d394c91fbed208c2cf002872f11550cd35fbab',
    type: 'distribution',
  },
  BROWSER_REACT_PROFILER_ROUTE_BASE_DURATION: {
    name: 'browser.react.profiler.route.base_duration',
    hash: '1a0cc657855391adcd36b98829d0c83991b8eef57c93564bf9bf1a1ee0f7036c',
    type: 'distribution',
  },
  BROWSER_REACT_PROFILER_ROUTE_COMMIT_LAG: {
    name: 'browser.react.profiler.route.commit_lag',
    hash: '1bb160294f50714704b572b8cf928a2401845250032d0983d7938278f382737f',
    type: 'distribution',
  },
  BROWSER_REACT_HYDRATION_DURATION: {
    name: 'browser.react.hydration.duration',
    hash: '82c79908e1a129f357f84b61e17741c540b1b31979f0162318250ef2449646fe',
    type: 'distribution',
  },
  BROWSER_REACT_PROFILER_ROUTE_RENDER_EFFICIENCY: {
    name: 'browser.react.profiler.route.render_efficiency',
    hash: 'beef377799cdd79641899e0a78b2c5002494e02ebe125eb0c0d3920eb8623a1e',
    type: 'distribution',
  },
  BROWSER_REACT_PROFILER_APP_RENDER_EFFICIENCY: {
    name: 'browser.react.profiler.app.render_efficiency',
    hash: 'b22af24d9571ad02d8dc59c8778fee9505bcd909d5558dd5243521d2b4796a1d',
    type: 'distribution',
  },
  IPM_COMPONENT_RENDER: {
    name: 'in_product_messaging.component.render',
    hash: '14324adfc1e3ee32f28ab57e9ecb7a204e399c0af45063425ee48e9b37ed1604',
    type: 'distribution',
  },
  IPM_COMPONENT_ERROR: {
    name: 'in_product_messaging.component.error',
    hash: 'dcac1e118c5564253075fd0663b0c3888dcc5bc71bf7ae3afa78b3f084ef543b',
    type: 'count',
  },
  IPM_COMPONENT_VISIBLE: {
    name: 'in_product_messaging.component.visible',
    hash: '5d564d7f63a19c5bafadda2aaf50d43b44067f60e8b102263bb1fe94055ef57a',
    type: 'count',
  },
  IPM_COMPONENT_DISMISS: {
    name: 'in_product_messaging.component.dismiss',
    hash: '94f9dd376d2ad75067112f7eac3f5d1f4d46e266e3b2c4d87067ae34ac400c3f',
    type: 'count',
  },
  IPM_ACTION: {
    name: 'in_product_messaging.action',
    hash: '7a37c5cc6393ba5324b57b62b625a7ab8f85ce70cf53d211deabec3629d2c04a',
    type: 'count',
  },
  BROWSER_VITALS_DIST_INP_INPUT_DELAY: {
    name: 'browser.vitals.dist.inp.input_delay',
    hash: 'f8b3556c61cefdd20a76119f6d07eda34630fe54e3ba3f39606ace136d7e375e',
    type: 'distribution',
  },
  BROWSER_VITALS_DIST_INP_PROCESSING: {
    name: 'browser.vitals.dist.inp.processing',
    hash: '99440bcc187f689ff36aa9ec2e217ad70ee254143b467f4d156c241102d26b28',
    type: 'distribution',
  },
  BROWSER_VITALS_DIST_INP_PRESENTATION: {
    name: 'browser.vitals.dist.inp.presentation',
    hash: '5cae05a9e69973623a8cfd82f64689b017be8c1d04c9bf873960767c246f1247',
    type: 'distribution',
  },
  ISSUES_SHOW_HPC: {
    name: 'issues.show.hpc',
    hash: 'c759e7a27c38442130f055911b544bce97789db5b8b390f57d35386f6f234b7f',
    type: 'distribution',
  },
  BROWSER_VITALS_SUPPRESSED: {
    name: 'browser.vitals.suppressed',
    hash: '537aa3499772d75ec67b59e3e5a6065af1212ecfe594c522939d0fa02147fb1b',
    type: 'count',
  },
  BROWSER_VITALS_SESSION: {
    name: 'browser.vitals.session',
    hash: '467ac7d28cdbf4c8a7c33ccc8dd1986b474115bb57db3f0504b490d3e30455e3',
    type: 'count',
  },
  LANDING_PAGES_VITALS_HPC: {
    name: 'landing_pages.vitals.hpc',
    hash: '104639e052e30bca541c4acbc2374b70c80ab5de8571a20254a0f61e04180f11',
    type: 'distribution',
  },
  LANDING_PAGES_VITALS_CLS: {
    name: 'landing_pages.vitals.cls',
    hash: 'ee1b16995cee9f07c6cc0e26d6408cea02baface4b562d934394311ac22559cd',
    type: 'distribution',
  },
  LANDING_PAGES_VITALS_LCP: {
    name: 'landing_pages.vitals.lcp',
    hash: '24f158c0b36f58a0edcb60eab9b0477f3b635f67bd5202e65e80bb17982a8b00',
    type: 'distribution',
  },
  LANDING_PAGES_VITALS_INP: {
    name: 'landing_pages.vitals.inp',
    hash: '203b2f53cf07984b95d893c21fb643bff3e494eeec63360d9d4189340e7c5fd6',
    type: 'distribution',
  },
  TURBO_ERROR_RESPONSE_NOT_HTML: {
    name: 'turbo.error.response.not_html',
    hash: 'f1b17addcb274c9155f3bb858bfbc8a43e80f718ed0df653e355d0d57c188517',
    type: 'increment',
  },
  CODE_VIEW_REPO_OVERVIEW_HPC: {
    name: 'code-view.repo-overview.hpc',
    hash: 'cd3bc78d2aece4879ae103bd22362fd031ea7144e2658d3a5bc7f475819dfdea',
    type: 'distribution',
  },
  CODE_VIEW_TREE_HPC: {
    name: 'code-view.tree.hpc',
    hash: 'f22a7626ef638ad3492f13c84a79ae4fe199006ca0729b4d189e25a78c67b0f2',
    type: 'distribution',
  },
  CODE_VIEW_TREE_INP: {
    name: 'code_view.tree.inp',
    hash: 'bcb586ccdc889f22fa01ec8b6090373b03b39f1bea96a17f6684c6df573d3ebb',
    type: 'distribution',
  },
  CODE_VIEW_REPO_OVERVIEW_INP: {
    name: 'code_view.repo_overview.inp',
    hash: '677d3d81e569656264d5e628a09d0217bbc7652befb675bd11bbaf64e340e2c2',
    type: 'distribution',
  },
  BROWSER_VITALS_COUNT_RAGE_CLICK: {
    name: 'browser.vitals.count.rage_click',
    hash: '6ff467b20e178da44592fcb783e3840254df979c1f37ea6020ec85e50cecd76e',
    type: 'count',
  },
  BROWSER_VITALS_COUNT_DEAD_CLICK: {
    name: 'browser.vitals.count.dead_click',
    hash: '831d247836ee640be6cae794e527741c02fed8ac0eb70ce358e9d83a4cf73774',
    type: 'count',
  },
  BROWSER_VITALS_COUNT_ERROR_CLICK: {
    name: 'browser.vitals.count.error_click',
    hash: 'd3eaba67324c0c92c2665a3de5f7932c5d2a64d8e0e6a09259bac8518bfd4c1e',
    type: 'count',
  },
  BROWSER_VITALS_DIST_TYPING_AVG_INPUT_DELAY: {
    name: 'browser.vitals.dist.typing.avg_input_delay',
    hash: '324ec3b8bbe07371113cfe81f76e79c94d13bba651c3e6f0e6f01445d040411d',
    type: 'distribution',
  },
  BROWSER_VITALS_DIST_TYPING_MAX_INPUT_DELAY: {
    name: 'browser.vitals.dist.typing.max_input_delay',
    hash: '197e0245622487316d8958889da4666fb3c4b10a86aa7240c6aa902f12766d51',
    type: 'distribution',
  },
  BROWSER_VITALS_DIST_TYPING_TOTAL_INPUT_DELAY: {
    name: 'browser.vitals.dist.typing.total_input_delay',
    hash: '37451a318e75d9a7d87bc0da6a0691a6313b67c74c98216a4d9faa4fb2c42ab3',
    type: 'distribution',
  },
  BROWSER_VITALS_ICV: {
    name: 'browser.vitals.icv',
    hash: '1cc9ea5c3ce983ede65ce4ed243fef0dd4da584bc8058eb0ea8912e3c74e47cf',
    type: 'distribution',
  },
  COPILOT_DOTCOM_CHAT_FIRST_MESSAGE_SENT: {
    name: 'copilot.dotcom_chat.first_message_sent',
    hash: '38290751a89248e85e91b29b3917953b9cd55c23f3fab0fa04c5f9bd4191bbf0',
    type: 'count',
  },
  COPILOT_DOTCOM_CHAT_FIRST_MESSAGE_RENDERED: {
    name: 'copilot.dotcom_chat.first_message_rendered',
    hash: 'bc8fb91e82598ab9d25e085b42656ed707a55358acd8343ceb3644ac2e4695d2',
    type: 'count',
  },
  REACT_PRELOAD_COUNT: {
    name: 'react.preload.count',
    hash: '4cd2f305d3c94858b4d223e07af6dd231e0243dc3e87ae73648bde7432c6c135',
    type: 'increment',
  },
  REACT_PRELOAD_HIT: {
    name: 'react.preload.hit',
    hash: '0e448d78ce4a410f9e4a7764cfde6f92b77bb6b2daf63b34985bfb1c172e61f0',
    type: 'increment',
  },
  REACT_PRELOAD_REJECTED: {
    name: 'react.preload.rejected',
    hash: '48ca6b39df849f115dd6d594c408e5fe5ce6bce19bb046a48c1aa383149eff47',
    type: 'increment',
  },
  REACT_PRELOAD_FETCH_STATUS: {
    name: 'react.preload.fetch_status',
    hash: '0f7769005c3c0e29bc4b679861ef3193589eab50296ced09f1dc38084d4595b0',
    type: 'increment',
  },
  REACT_PRELOAD_LATENCY: {
    name: 'react.preload.latency',
    hash: '7b6a976e61923df7ef9c224b8166f58c192f0cadb98a4a689cd56803d49a0f44',
    type: 'distribution',
  },
  REACT_QUERY_SCHEMA_ERROR: {
    name: 'react.query.schema.error',
    hash: '35d4179ab65c74a2457b6521f221d698412b2f9bc6a492f86c6441598dc962bb',
    type: 'increment',
  },
  REACT_QUERY_SCHEMA_PARSE_TIME: {
    name: 'react.query.schema.parse_time',
    hash: '0b2d148037181cd696a784033d3d6e57c394b4b596b9016353d26c7e18a60257',
    type: 'distribution',
  },
  BROWSER_VITALS_DIST_CONTAINER_TIMING: {
    name: 'browser.vitals.dist.container_timing',
    hash: '569626966eec3dfd0b04e104038457efee97febeb0cd338d227968a6cbb51ccf',
    type: 'distribution',
  },
  BROWSER_VITALS_CONTAINER_TIMING_SUPPORTED: {
    name: 'browser.vitals.container_timing.supported',
    hash: 'b9d86827d961ec19fcd37142b0fbdf491f72e3e37155b98bca65e623fe923312',
    type: 'count',
  },
  REACT_QUERY_TIME: {
    name: 'react.query.time',
    hash: 'c8b14de5d2da6c80953895af539b6f0c8d43149ccfdf1e30ee47e9eb851def5f',
    type: 'distribution',
  },
  TRUSTED_TYPES_POLICY_CALLED: {
    name: 'trusted_types.policy.called',
    hash: '390cf02e0febd4a163b4682b85ceaa0f870c5e8efc6cada07ffbd72e6841278d',
    type: 'increment',
  },
  TRUSTED_TYPES_POLICY_ERROR: {
    name: 'trusted_types.policy.error',
    hash: '807c3dfa83eec0676d7ff0d8f4bc8929d9eadf660afeb6d72321f41480c5ae97',
    type: 'increment',
  },
  TRUSTED_TYPES_POLICY_INITIALIZED_TWICE: {
    name: 'trusted_types.policy.initialized_twice',
    hash: '76c378aa8ac484eea97e2f10edb8a5ebba065c679576cb69f43df1e58d039455',
    type: 'increment',
  },
  BROWSER_TURBO_ERROR: {
    name: 'browser.turbo.error',
    hash: '886addcf546c8e1f1cda17a3bef50d60e80eeee32dc7d315a05f2c44466f067a',
    type: 'increment',
  },
  BROWSER_TURBO_ERROR_MISMATCH: {
    name: 'browser.turbo.error.mismatch',
    hash: '8b224cd808936325bd88c93dc1fc1fe4a9ee6586b19679ea3ecd5f8b1a4abf65',
    type: 'increment',
  },
  BROWSER_TURBO_ERROR_OVERHEAD: {
    name: 'browser.turbo.error.overhead',
    hash: 'b3c1b0ec7d0372ab529ce4fc3a8884abb5eea5a8854e089544426b06744a635f',
    type: 'distribution',
  },
  ACTIONS_COMPLETED_LOG_TIME_TO_FIRST_CONTENT: {
    name: 'actions.completed_log.time_to_first_content',
    hash: '07558401e46877b8d3daee29e1e737b657a71978f9010944c9d17c8a50a06253',
    type: 'timing',
  },
  ACTIONS_COMPLETED_LOG_RENDER_DURATION: {
    name: 'actions.completed_log.render_duration',
    hash: '93396102c2724daea9ae47528761ca7934d1a586d72a28f098c46d52ab91ddf7',
    type: 'timing',
  },
  ACTIONS_COMPLETED_LOG_FLUSH_COUNT: {
    name: 'actions.completed_log.flush_count',
    hash: '554a23236d9258143a37f1e368c872c5351fed1d6ee0e0b0ce9c404615ecad8c',
    type: 'distribution',
  },
  ACTIONS_COMPLETED_LOG_SIZE_BYTES: {
    name: 'actions.completed_log.size_bytes',
    hash: 'c748ad64a25023da2a3d5f3c46d40b9520a76453b6d4df3058c29867b4d69218',
    type: 'distribution',
  },
} as const satisfies Record<string, CustomMetric>

export type CustomMetricKey = keyof typeof CUSTOM_METRIC_REGISTRY
