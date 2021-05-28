<template>
  <div class="demo-step-container">
    <mu-stepper :active-step="activeStep">
      <mu-step>
        <mu-step-label> 选择活动地点</mu-step-label>
      </mu-step>
      <mu-step>
        <mu-step-label> 创建一个群组</mu-step-label>
      </mu-step>
      <mu-step>
        <mu-step-label> 宣传活动</mu-step-label>
      </mu-step>
    </mu-stepper>
    <div class="demo-step-content">
      <p v-if="finished">
        都完成啦!<a href="javascript:" @click="reset">点这里</a>可以重置
      </p>
      <template v-if="!finished">
        <p>
          {{ content }}
        </p>
        <div>
          <mu-button
              flat
              class="demo-step-button"
              :disabled="activeStep === 0"
              @click="handlePrev"
          >
            上一步
          </mu-button>
          <mu-button
              class="demo-step-button"
              color="primary"
              @click="handleNext"
          >
            {{ activeStep === 2 ? "完成" : "下一步" }}
          </mu-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeStep: 0,
    };
  },
  computed: {
    content() {
      let message = "";
      switch (this.activeStep) {
        case 0:
          message = "选择一个活动的地点";
          break;
        case 1:
          message = "创建群组，50人左右";
          break;
        case 2:
          message = "多在群里发消息宣传宣传";
          break;
        default:
          message = "fuck! 又 TM 出错了！！！";
          break;
      }
      return message;
    },
    finished() {
      return this.activeStep > 2;
    },
  },
  methods: {
    handleNext() {
      this.activeStep++;
    },
    handlePrev() {
      this.activeStep--;
    },
    reset() {
      this.activeStep = 0;
    },
  },
};
</script>

<style scoped>
</style>