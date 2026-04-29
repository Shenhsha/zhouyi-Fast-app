const fs = require('fs');
const content = `<template>
  <div class="container">
    <div class="page" if="{{currentPage === 'home'}}">
      <text class="title">周易起卦</text>
      <text class="subtitle">心诚则灵 · 三不占</text>
      <div class="menu-list">
        <text class="menu-item" @click="goToRitual('shake')">手动摇卦</text>
        <text class="menu-item" @click="goToRitual('manual')">手工指定</text>
        <text class="menu-item" @click="startDivination('time')">时间起卦</text>
        <text class="menu-item" @click="startDivination('auto')">电脑自动</text>
      </div>
    </div>

    <div class="page" if="{{currentPage === 'ritual'}}">
      <text class="title-small">三不占原则</text>
      <div class="card">
        <text class="rule-title">① 不诚不占</text>
        <text class="rule-text">此乃求教于神明，首重真诚。</text>
      </div>
      <div class="card">
        <text class="rule-title">② 不义不占</text>
        <text class="rule-text">不合乎正当性及合理性的问题，不必占问。</text>
      </div>
      <div class="card">
        <text class="rule-title">③ 不疑不占</text>
        <text class="rule-text">必须是理性难以测度之事。</text>
      </div>
      <text class="title-small mt">起卦须知</text>
      <text class="notice">集中意念，心中默念所测之事，一事一卦。</text>
      <text class="btn" @click="proceedToAction()">开始起卦</text>
      <text class="btn-outline" @click="goHome()">返回</text>
    </div>

    <div class="page" if="{{currentPage === 'action'}}">
      <text class="title-small">{{actionTitle}}</text>
      <text class="subtitle" if="{{currentMode === 'shake'}}">点击按钮抛掷铜钱</text>
      <text class="subtitle" if="{{currentMode === 'manual'}}">点击爻位切换阴阳</text>
      
      <div class="coin-area" if="{{currentMode === 'shake'}}">
        <div class="coin-row">
          <text class="coin">{{coin1}}</text>
          <text class="coin">{{coin2}}</text>
          <text class="coin">{{coin3}}</text>
        </div>
        <text class="result-text">{{shakeResult}}</text>
      </div>

      <div class="hexagram-container">
        <div class="yao-row" for="{{(index, line) in previewLines}}" @click="toggleLine(index)" if="{{currentMode === 'manual'}}">
          <div class="{{line.isYang ? 'yang-line' : 'yin-line'}}">
            <div class="line" if="{{!line.isYang}}"></div>
          </div>
        </div>
        <div class="yao-row" for="{{(index, line) in previewLines}}">
          <div class="{{line.isYang ? 'yang-line' : 'yin-line'}}">
            <div class="line" if="{{!line.isYang}}"></div>
          </div>
          <text class="old-mark" if="{{line.isOld}}">{{line.value === 9 ? '○' : '×'}}</text>
        </div>
      </div>

      <text class="btn" @click="triggerShake()" if="{{currentMode === 'shake' && shakeCount < 6}}">抛掷铜钱 ({{shakeCount + 1}}/6)</text>
      <text class="btn" if="{{currentMode === 'shake' && shakeCount >= 6}}">起卦完成</text>
      <text class="btn" @click="showResult()" if="{{currentMode === 'manual'}}">确定</text>
      <text class="btn-outline" @click="goRitual()">返回</text>
    </div>

    <div class="page" if="{{currentPage === 'result'}}">
      <text class="result-title">{{resultGua.name}}</text>
      <text class="result-subtitle">{{showChange ? '本卦·变卦' : '本卦'}}</text>
      
      <div class="hexagram-display">
        <div class="yao-row" for="{{(index, line) in resultLines}}">
          <div class="{{line.isYang ? 'yang-line' : 'yin-line'}}">
            <div class="line" if="{{!line.isYang}}"></div>
          </div>
        </div>
      </div>

      <div class="change-section" if="{{showChange}}">
        <text class="result-subtitle">变卦</text>
        <div class="hexagram-display small">
          <div class="yao-row" for="{{(index, line) in changedLines}}">
            <div class="{{line.isYang ? 'yang-line' : 'yin-line'}}">
              <div class="line" if="{{!line.isYang}}"></div>
            </div>
          </div>
        </div>
        <text class="result-name">{{changedGua.name}}</text>
      </div>

      <div class="card">
        <text class="card-title">卦辞</text>
        <text class="card-text">{{resultGua.ci}}</text>
      </div>

      <div class="card">
        <text class="card-title">解读</text>
        <text class="card-text">{{resultGua.desc}}</text>
      </div>

      <text class="btn" @click="resetApp()">重新起卦</text>
    </div>
  </div>
</template>

<script>
  import vibrator from '@system.vibrator'

  export default {
    data: {
      currentPage: 'home',
      currentMode: '',
      actionTitle: '起卦',
      shakeCount: 0,
      coin1: '字',
      coin2: '字',
      coin3: '字',
      shakeResult: '准备抛掷',
      isShaking: false,
      currentLines: [],
      previewLines: [],
      resultLines: [],
      changedLines: [],
      resultGua: {},
      changedGua: {},
      showChange: false,
    },

    hexagramData: {
      '111111': { name: '乾为天', ci: '元，亨，利，贞。', desc: '大吉之象，宜进取，但需刚健中正。' },
      '000000': { name: '坤为地', ci: '元，亨，利牝马之贞。', desc: '厚德载物，宜顺势而为，包容万物。' },
      '100010': { name: '水雷屯', ci: '元，亨，利，贞。勿用有攸往。', desc: '万事起头难，宜积蓄力量，不可轻进。' },
      '010001': { name: '山水蒙', ci: '亨。匪我求童蒙，童蒙求我。', desc: '启蒙之时，宜求知，切勿盲目行动。' },
      '111010': { name: '水天需', ci: '有孚，光亨，贞吉。利涉大川。', desc: '等待时机，饮食宴乐，积蓄以待。' },
      '010111': { name: '天水讼', ci: '有孚，窒惕，中吉，终凶。', desc: '争执之象，宜和解，不可争强好胜。' },
      '010000': { name: '地水师', ci: '贞，丈人，吉，无咎。', desc: '行军打仗之象，需要严明的纪律和领袖。' },
      '000010': { name: '水地比', ci: '吉。原筮，元永贞，无咎。', desc: '亲密比辅，团结互助，诸事皆顺。' },
      '111011': { name: '风天小畜', ci: '亨。密云不雨，自我西郊。', desc: '力量稍显不足，宜蓄养实力，待机而动。' },
      '110111': { name: '天泽履', ci: '履虎尾，不咥人，亨。', desc: '如履薄冰，需小心谨慎，遵守礼仪。' },
      '111000': { name: '地天泰', ci: '小往大来，吉，亨。', desc: '天地交泰，通达顺利，小往大来。' },
      '000111': { name: '天地否', ci: '否之匪人，不利君子贞，大往小来。', desc: '天地不交，闭塞不通，宜韬光养晦。' },
      '101111': { name: '天火同人', ci: '同人于野，亨。利涉大川。', desc: '与人和同，集思广益，利于合作。' },
      '111101': { name: '火天大有', ci: '元亨。', desc: '盛大丰有，如日中天，多喜多福。' },
      '001000': { name: '地山谦', ci: '亨，君子有终。', desc: '谦虚受益，内高外低，诸事吉利。' },
      '000100': { name: '雷地豫', ci: '利建侯行师。', desc: '雷出地奋，顺时而动，安乐预备。' },
      '100110': { name: '泽雷随', ci: '元亨利贞，无咎。', desc: '随顺之时，顺应时势，灵活变通。' },
      '011001': { name: '山风蛊', ci: '元亨，利涉大川。', desc: '蛊坏之象，需整顿改革，拨乱反正。' },
      '110000': { name: '地泽临', ci: '元，亨，利，贞。至于八月有凶。', desc: '居高临下，渐渐壮大，需防盛极而衰。' },
      '000011': { name: '风地观', ci: '盥而不荐，有孚颙若。', desc: '观摩瞻仰，诚信庄严，展示风采。' },
      '100101': { name: '火雷噬嗑', ci: '亨。利用狱。', desc: '咬碎障碍，恩威并施，铲除奸邪。' },
      '101001': { name: '山火贲', ci: '亨。小利有攸往。', desc: '文饰美化，注重形式，小事可成。' },
      '000001': { name: '山地剥', ci: '不利有攸往。', desc: '剥落之象，阴盛阳衰，宜静不宜动。' },
      '100000': { name: '地雷复', ci: '亨。出入无疾，朋来无咎。', desc: '一阳来复，万物复苏，循环往复。' },
      '100111': { name: '天雷无妄', ci: '元，亨，利，贞。其匪正有眚。', desc: '无妄之灾，真实无虚，顺其自然。' },
      '111001': { name: '山天大畜', ci: '利贞。不家食，吉。', desc: '大畜积德，积小成大，适时而止。' },
      '100001': { name: '山雷颐', ci: '贞吉。观颐，自求口实。', desc: '颐养生息，慎言节食，注重养生。' },
      '011110': { name: '泽风大过', ci: '栋桡，利有攸往，亨。', desc: '非常时期，压力巨大，需独立支撑。' },
      '010010': { name: '坎为水', ci: '习坎，有孚，维心亨，行有尚。', desc: '重重险陷，诚信脱险，不可轻举妄动。' },
      '101101': { name: '离为火', ci: '利贞，亨。畜牝牛，吉。', desc: '附丽光明，柔顺中正，热情如火。' },
      '001110': { name: '泽山咸', ci: '亨，利贞，取女吉。', desc: '感应沟通，心灵相通，婚姻吉利。' },
      '011100': { name: '雷风恒', ci: '亨，无咎，利贞，利有攸往。', desc: '恒久之道，持之以恒，守常不变。' },
      '001111': { name: '天山遁', ci: '亨，小利贞。', desc: '急流勇退，隐避避世，明哲保身。' },
      '111100': { name: '雷天大壮', ci: '利贞。', desc: '壮大昌盛，阳气旺盛，宜守正道。' },
      '000101': { name: '火地晋', ci: '康侯用锡马蕃庶，昼日三接。', desc: '旭日东升，步步高升，得志于时。' },
      '101000': { name: '地火明夷', ci: '利艰贞。', desc: '光明受损，韬光养晦，艰难守正。' },
      '101011': { name: '风火家人', ci: '利女贞。', desc: '家庭伦理，相夫教子，家道正正。' },
      '110101': { name: '火泽睽', ci: '小事吉。', desc: '二女同居，其志不同，小事吉利。' },
      '001010': { name: '水山蹇', ci: '利西南，不利东北。', desc: '寸步难行，险阻在前，宜停顿反省。' },
      '010100': { name: '雷水解', ci: '利西南。', desc: '困难缓解，雷雨作解，赦免过失。' },
      '110001': { name: '山泽损', ci: '有孚，元吉，无咎，可贞。', desc: '损下益上，先难后易，失小得大。' },
      '100011': { name: '风雷益', ci: '利有攸往，利涉大川。', desc: '损上益下，助人为乐，大吉大利。' },
      '111110': { name: '泽天夬', ci: '扬于王庭，孚号，有厉。', desc: '决断之时，清除小人，需警惕果决。' },
      '011111': { name: '天风姤', ci: '女壮，勿用取女。', desc: '不期而遇，阴长阳消，防范不正。' },
