<template>
  <div>
    {{ key1 ? '[' : '' }}<span v-if="key1" class="kb">{{ key1 }}</span><span v-else>...</span>{{ key2? '/' : '' }}<span v-if="key2" class="kb">{{ key2 }}</span>{{ key1 ? ']' : '' }}
    {{ text }}:&nbsp;
    <span v-if="val !== undefined" class="right val">{{ val }}</span>
  </div>
</template>

<script>

export default {
  name: 'BaseParam',
  props: {
    key1: String,
    key2: String,
    text: String,
    val: [String, Number],
  },
}
</script>

<style>
.right {
  float: right;
}
.val {
  font-weight: bold;
  color: #DB5;
}
.kb {
  font-weight: bold;
  color: #5BD;
}
</style>